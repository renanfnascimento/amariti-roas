'use server';

import { revalidatePath } from 'next/cache';
import { getSupabase } from '@/lib/supabase';

// ── Resultado de um lote ──────────────────────────────────────────────────────

export interface ImportResult {
  imported: number;
  skipped:  number;
  columns:  string[];
  sheets?:  string[];
  error?:   string;
}

// ── Normalização de chaves ────────────────────────────────────────────────────

function norm(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ');
}

// ── Mapa: coluna CSV/XLSX normalizada → campo da tabela ───────────────────────

const COLUMN_MAP: Record<string, string> = {
  // SKU / ID do Item
  'id do item':                           'sku',
  'sku pai':                              'sku',
  'sku do produto':                       'sku',
  'sku':                                  'sku',
  'codigo sku':                           'sku',
  'id do produto':                        'sku',
  'parent sku':                           'sku',
  'item sku':                             'sku',

  // Nome
  'nome do produto':                      'product_name',
  'nome':                                 'product_name',
  'produto':                              'product_name',
  'descricao':                            'product_name',
  'item name':                            'product_name',
  'product name':                         'product_name',

  // Views orgânicas
  'visualizacoes da pagina do produto':   'organic_views',
  'visualizacoes':                        'organic_views',
  'visitas ao produto':                   'organic_views',
  'visitantes':                           'organic_views',
  'impressoes':                           'organic_views',
  'page views':                           'organic_views',
  'product page views':                   'organic_views',

  // Pedidos orgânicos
  'pedidos':                              'organic_conversions',
  'numero de pedidos':                    'organic_conversions',
  'quantidade de pedidos':                'organic_conversions',
  'total de pedidos':                     'organic_conversions',
  'pedidos realizados':                   'organic_conversions',
  'orders':                               'organic_conversions',
  'total orders':                         'organic_conversions',

  // Faturamento / Receita
  'vendas':                               'revenue',
  'pagamento confirmado (brl)':           'revenue',
  'total de vendas':                      'revenue',
  'faturamento':                          'revenue',
  'receita':                              'revenue',
  'valor das vendas':                     'revenue',
  'gmv':                                  'revenue',
  'revenue':                              'revenue',

  // Taxa de Conversão
  'taxa de conversao':                    'conversion_rate',
  'taxa de conversao de pedidos':         'conversion_rate',
  'conversion rate':                      'conversion_rate',
  'conv. rate':                           'conversion_rate',

  // Gasto em Anúncios
  'gastos':                               'ads_spend',
  'gastos totais':                        'ads_spend',
  'gastos com anuncios':                  'ads_spend',
  'gasto em anuncios':                    'ads_spend',
  'custo de anuncio':                     'ads_spend',
  'valor gasto em anuncio':               'ads_spend',
  'custo total':                          'ads_spend',
  'ad spend':                             'ads_spend',
  'cost':                                 'ads_spend',

  // Conversões via Anúncios
  'pedidos via anuncios':                 'ads_conversions',
  'pedidos de anuncios':                  'ads_conversions',
  'conversoes de anuncios':               'ads_conversions',
  'pedidos de ads':                       'ads_conversions',
  'ad orders':                            'ads_conversions',
  'orders from ads':                      'ads_conversions',

  // ROAS
  'roas':                                 'roas_score',
  'retorno sobre investimento':           'roas_score',
  'retorno sobre o gasto com anuncios':   'roas_score',
  'return on ad spend':                   'roas_score',
  'roi':                                  'roas_score',

  // Receita via Ads (calculado → ROAS)
  'faturamento via anuncios':             'ads_revenue',
  'receita de anuncios':                  'ads_revenue',
  'ad revenue':                           'ads_revenue',
  'revenue from ads':                     'ads_revenue',
};

// Campos que chegam com o nome correto do campo de destino (sem passar pelo COLUMN_MAP)
const DIRECT_PASSTHROUGH = new Set(['shopee_diagnosis']);

// ── Parser de número pt-BR / monetário ───────────────────────────────────────

function parsePtBrNumber(raw: string): number {
  const s = (raw ?? '').replace(/R\$|[%\s]/g, '').trim();
  if (!s || s === '-' || s === '—' || s === 'N/A' || s === '--') return 0;
  if (s.includes(',')) {
    return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
  }
  return parseFloat(s) || 0;
}

// ── Server Action — recebe um lote (chunk) de linhas já parseadas ─────────────
// O cliente divide o array total em chunks antes de chamar esta função,
// eliminando o limite de payload do Next.js.

export async function importShopeeCSV(
  rawRows:   Record<string, string>[],
  shopIndex: 1 | 2,
): Promise<ImportResult> {
  try {
    if (!rawRows.length) return { imported: 0, skipped: 0, columns: [] };

    // ── 1. Verificação de credenciais do Supabase ─────────────────────────────
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

    if (!supabaseUrl?.startsWith('https://') || !supabaseKey || supabaseKey.length < 20) {
      console.error('[importCsv] Credenciais Supabase ausentes:', {
        url:    supabaseUrl ?? '(não definida)',
        hasKey: !!supabaseKey,
      });
      return {
        imported: 0, skipped: 0, columns: [],
        error: 'Faltam credenciais do Supabase no servidor (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)',
      };
    }

    // ── 2. Resolve shop_id (env real ou índice como fallback em dev) ──────────
    const envShopId = (process.env[`SHOPEE_SHOP_ID_${shopIndex}`] ?? '').trim();
    const shopId    = envShopId ? Number(envShopId) : shopIndex;
    if (!envShopId) {
      console.warn(`[importCsv] SHOPEE_SHOP_ID_${shopIndex} ausente — usando shop_id=${shopId} como fallback`);
    }

    // ── 3. Mapeamento de colunas ──────────────────────────────────────────────
    const headers     = Object.keys(rawRows[0]).filter(h => !DIRECT_PASSTHROUGH.has(h));
    const detectedCols: string[] = [];
    const headerIndex = new Map<string, string>();

    for (const h of headers) {
      const field = COLUMN_MAP[norm(h)];
      if (field) {
        headerIndex.set(h, field);
        if (!detectedCols.includes(field)) detectedCols.push(field);
      }
    }

    const sheetsInData = [...new Set(rawRows.map(r => r['shopee_diagnosis']).filter(Boolean))];
    console.log(`[importCsv] lote ${rawRows.length} linhas | abas: ${sheetsInData.join(', ') || '—'} | campos: ${detectedCols.join(', ')}`);

    // ── 4. Transforma linhas em registros de DB ───────────────────────────────
    const toInsert: Record<string, unknown>[] = [];
    let skipped = 0;

    for (const row of rawRows) {
      const mapped: Record<string, unknown> = { shop_id: shopId };

      for (const f of DIRECT_PASSTHROUGH) {
        if (row[f] !== undefined) mapped[f] = row[f].trim();
      }

      for (const [csvCol, dbField] of headerIndex.entries()) {
        const raw = row[csvCol] ?? '';
        if (dbField === 'sku' || dbField === 'product_name') {
          mapped[dbField] = raw.trim();
        } else {
          // Garante que campos numéricos cheguem ao Supabase como Number, não string
          mapped[dbField] = Number(parsePtBrNumber(raw));
        }
      }

      if (!mapped['sku'] || String(mapped['sku']).trim() === '') {
        skipped++;
        continue;
      }

      // Calcula ROAS quando tiver receita/gasto mas ROAS não vier no arquivo
      const spend = Number(mapped['ads_spend']  ?? 0);
      const rev   = Number(mapped['ads_revenue'] ?? 0);
      const roas  = Number(mapped['roas_score']  ?? 0);
      if (roas === 0 && spend > 0 && rev > 0) {
        mapped['roas_score'] = parseFloat((rev / spend).toFixed(4));
      }
      delete mapped['ads_revenue'];

      // crm_status, cover_change_count e last_optimized_at são AUSENTES do payload:
      // DB aplica defaults em INSERT e upsert preserva valores existentes em UPDATE.
      mapped['updated_at'] = new Date().toISOString();
      toInsert.push(mapped);
    }

    if (!toInsert.length) {
      return { imported: 0, skipped, columns: detectedCols, sheets: sheetsInData,
               error: 'Nenhuma linha com SKU válido no lote' };
    }

    // ── 5. Upsert no Supabase ─────────────────────────────────────────────────
    const supabase = getSupabase();

    // Pre-flight: verifica se a tabela existe antes do upsert.
    // Schema ou tabela ausente gera TypeError: fetch failed no Next.js,
    // mascarando o erro real. Este SELECT captura o erro Supabase legível.
    const { error: pingErr } = await supabase
      .from('shopee_performance_data')
      .select('shop_id')
      .limit(0);

    if (pingErr) {
      console.error('[importCsv] Tabela inacessível:', {
        message: pingErr.message,
        details: pingErr.details,
        hint:    pingErr.hint,
        code:    pingErr.code,
      });
      return {
        imported: 0, skipped, columns: detectedCols, sheets: sheetsInData,
        error: `Tabela inacessível (${pingErr.code ?? 'ERR'}): ${pingErr.message}${pingErr.hint ? ` — ${pingErr.hint}` : ''}`,
      };
    }

    // Log do primeiro item para confirmar formato dos dados antes do upsert
    console.log('[importCsv] Primeiro item do lote:', JSON.stringify(toInsert[0]));

    const { error: dbErr } = await supabase
      .from('shopee_performance_data')
      .upsert(toInsert as never[], { onConflict: 'shop_id,sku' });

    if (dbErr) {
      console.error('[importCsv] Supabase upsert error:', {
        message: dbErr.message,
        details: dbErr.details,
        hint:    dbErr.hint,
        code:    dbErr.code,
      });
      return { imported: 0, skipped, columns: detectedCols, sheets: sheetsInData,
               error: `Supabase (${dbErr.code ?? 'ERR'}): ${dbErr.message}` };
    }

    console.log(`[importCsv] OK — ${toInsert.length} upserted, ${skipped} skipped`);
    revalidatePath('/dashboard/shopee-intelligence');
    revalidatePath('/shopee-ads');
    return { imported: toInsert.length, skipped, columns: detectedCols, sheets: sheetsInData };

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[importCsv] Erro inesperado:', msg);
    return { imported: 0, skipped: 0, columns: [], error: `Erro interno: ${msg}` };
  }
}
