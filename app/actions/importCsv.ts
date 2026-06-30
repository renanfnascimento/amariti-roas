'use server';

import { revalidatePath } from 'next/cache';
import { getSupabase } from '@/lib/supabase';

// ── Resultado da importação ───────────────────────────────────────────────────

export interface ImportResult {
  imported: number;
  skipped:  number;
  columns:  string[];
  sheets?:  string[];
  error?:   string;
}

// ── Normalização de chaves (remove acentos, lower, trim, espaços simples) ─────

function norm(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ');
}

// ── Mapa: coluna CSV/XLSX normalizada → campo da tabela ───────────────────────
// Cobre Business Insights, Relatório de Ads e Diagnóstico de Produtos

const COLUMN_MAP: Record<string, string> = {
  // ── SKU / ID do Item ──────────────────────────────────────────────────────
  'id do item':                           'sku',   // coluna exportada pelo Business Insights
  'sku pai':                              'sku',
  'sku do produto':                       'sku',
  'sku':                                  'sku',
  'codigo sku':                           'sku',
  'id do produto':                        'sku',
  'parent sku':                           'sku',
  'item sku':                             'sku',

  // ── Nome ───────────────────────────────────────────────────────────────────
  'nome do produto':                      'product_name',
  'nome':                                 'product_name',
  'produto':                              'product_name',
  'descricao':                            'product_name',
  'item name':                            'product_name',
  'product name':                         'product_name',

  // ── Views / impressões orgânicas ───────────────────────────────────────────
  'visualizacoes da pagina do produto':   'organic_views',
  'visualizacoes':                        'organic_views',
  'visitas ao produto':                   'organic_views',
  'visitantes':                           'organic_views',
  'impressoes':                           'organic_views',
  'page views':                           'organic_views',
  'product page views':                   'organic_views',

  // ── Pedidos orgânicos ──────────────────────────────────────────────────────
  'pedidos':                              'organic_conversions',
  'numero de pedidos':                    'organic_conversions',
  'quantidade de pedidos':                'organic_conversions',
  'total de pedidos':                     'organic_conversions',
  'pedidos realizados':                   'organic_conversions',
  'orders':                               'organic_conversions',
  'total orders':                         'organic_conversions',

  // ── Faturamento / Receita ──────────────────────────────────────────────────
  'vendas':                               'revenue',
  'pagamento confirmado (brl)':           'revenue',
  'total de vendas':                      'revenue',
  'faturamento':                          'revenue',
  'receita':                              'revenue',
  'valor das vendas':                     'revenue',
  'gmv':                                  'revenue',
  'revenue':                              'revenue',

  // ── Taxa de Conversão ──────────────────────────────────────────────────────
  'taxa de conversao':                    'conversion_rate',
  'taxa de conversao de pedidos':         'conversion_rate',
  'conversion rate':                      'conversion_rate',
  'conv. rate':                           'conversion_rate',

  // ── Gasto em Anúncios ─────────────────────────────────────────────────────
  'gastos':                               'ads_spend',
  'gastos totais':                        'ads_spend',
  'gastos com anuncios':                  'ads_spend',
  'gasto em anuncios':                    'ads_spend',
  'custo de anuncio':                     'ads_spend',
  'valor gasto em anuncio':               'ads_spend',
  'custo total':                          'ads_spend',
  'ad spend':                             'ads_spend',
  'cost':                                 'ads_spend',

  // ── Conversões via Anúncios ────────────────────────────────────────────────
  'pedidos via anuncios':                 'ads_conversions',
  'pedidos de anuncios':                  'ads_conversions',
  'conversoes de anuncios':               'ads_conversions',
  'pedidos de ads':                       'ads_conversions',
  'ad orders':                            'ads_conversions',
  'orders from ads':                      'ads_conversions',

  // ── ROAS ───────────────────────────────────────────────────────────────────
  'roas':                                 'roas_score',
  'retorno sobre investimento':           'roas_score',
  'retorno sobre o gasto com anuncios':   'roas_score',
  'return on ad spend':                   'roas_score',
  'roi':                                  'roas_score',

  // ── Receita via Ads (para calcular ROAS quando ausente) ────────────────────
  'faturamento via anuncios':             'ads_revenue',
  'receita de anuncios':                  'ads_revenue',
  'ad revenue':                           'ads_revenue',
  'revenue from ads':                     'ads_revenue',
};

// Campos que passam direto para a tabela sem precisar do COLUMN_MAP
// (já chegam com o nome correto do campo de destino)
const DIRECT_PASSTHROUGH = new Set(['shopee_diagnosis']);

// ── Parser de número pt-BR / monetário → float ────────────────────────────────
// Trata: "R$ 1.234,56", "1.234,56", "1234.56", "12,5%", "—", "N/A"

function parsePtBrNumber(raw: string): number {
  // Remove: R$, %, espaços — o que sobra é o número
  const s = (raw ?? '').replace(/R\$|[%\s]/g, '').trim();
  if (!s || s === '-' || s === '—' || s === 'N/A' || s === '--') return 0;
  // pt-BR: ponto = separador de milhar, vírgula = decimal
  if (s.includes(',')) {
    return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
  }
  return parseFloat(s) || 0;
}

// ── Server Action principal ───────────────────────────────────────────────────

export async function importShopeeCSV(
  rawRows:   Record<string, string>[],
  shopIndex: 1 | 2,
): Promise<ImportResult> {
  if (!rawRows.length) return { imported: 0, skipped: 0, columns: [], error: 'Arquivo vazio' };

  // Lê o shop_id real a partir do env — nunca exposto ao cliente
  const shopId = Number(
    (process.env[`SHOPEE_SHOP_ID_${shopIndex}`] ?? '').trim() || '0',
  );
  if (!shopId) {
    return {
      imported: 0, skipped: 0, columns: [],
      error: `SHOPEE_SHOP_ID_${shopIndex} não configurado no servidor. Verifique o arquivo .env.local.`,
    };
  }

  // Detecta colunas e monta índice: header original → campo da tabela
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

  // Coleta abas processadas (campo shopee_diagnosis presente nas linhas)
  const sheetsInData = [...new Set(rawRows.map(r => r['shopee_diagnosis']).filter(Boolean))];

  console.log(`[importCsv] ${rawRows.length} linhas | abas: ${sheetsInData.join(', ') || 'única'} | campos: ${[...headerIndex.values()].join(', ')}`);

  // Transforma linhas CSV/XLSX em linhas de DB
  const toInsert: Record<string, unknown>[] = [];
  let skipped = 0;

  for (const row of rawRows) {
    const mapped: Record<string, unknown> = { shop_id: shopId };

    // Campos de passagem direta (ex: shopee_diagnosis vindo da aba lida)
    for (const f of DIRECT_PASSTHROUGH) {
      if (row[f] !== undefined) mapped[f] = row[f].trim();
    }

    // Campos mapeados via COLUMN_MAP
    for (const [csvCol, dbField] of headerIndex.entries()) {
      const raw = row[csvCol] ?? '';
      if (dbField === 'sku' || dbField === 'product_name') {
        mapped[dbField] = raw.trim();
      } else {
        mapped[dbField] = parsePtBrNumber(raw);
      }
    }

    // SKU obrigatório
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

    mapped['updated_at'] = new Date().toISOString();
    toInsert.push(mapped);
  }

  if (!toInsert.length) {
    return { imported: 0, skipped, columns: detectedCols, sheets: sheetsInData, error: 'Nenhuma linha com SKU válido encontrada' };
  }

  const supabase = getSupabase();
  const { error: dbErr } = await supabase
    .from('shopee_performance_data')
    .upsert(toInsert as never[], { onConflict: 'shop_id,sku' });

  if (dbErr) {
    console.error('[importCsv] Supabase error:', dbErr.message);
    return { imported: 0, skipped, columns: detectedCols, sheets: sheetsInData, error: dbErr.message };
  }

  console.log(`[importCsv] OK — ${toInsert.length} upserted, ${skipped} skipped, abas: ${sheetsInData.join(', ')}`);
  revalidatePath('/dashboard/shopee-intelligence');
  revalidatePath('/shopee-ads');
  return { imported: toInsert.length, skipped, columns: detectedCols, sheets: sheetsInData };
}
