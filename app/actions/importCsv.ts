'use server';

import { revalidatePath } from 'next/cache';
import { getSupabase } from '@/lib/supabase';

// ── Resultado da importação ───────────────────────────────────────────────────

export interface ImportResult {
  imported: number;
  skipped:  number;
  columns:  string[];
  error?:   string;
}

// ── Normalização de chaves (remove acentos, lower, trim) ──────────────────────

function norm(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ');
}

// ── Mapa: coluna CSV normalizada → campo na tabela ────────────────────────────
// Cobre relatórios "Business Insights" e "Shopee Ads" em pt-BR e en

const COLUMN_MAP: Record<string, string> = {
  // SKU
  'sku pai':                              'sku',
  'sku':                                  'sku',
  'codigo sku':                           'sku',
  'id do produto':                        'sku',
  'parent sku':                           'sku',
  'item sku':                             'sku',

  // Nome do produto
  'nome do produto':                      'product_name',
  'nome':                                 'product_name',
  'produto':                              'product_name',
  'descricao':                            'product_name',
  'item name':                            'product_name',
  'product name':                         'product_name',

  // Views / impressões orgânicas
  'visualizacoes da pagina do produto':   'organic_views',
  'visualizacoes':                        'organic_views',
  'visitas ao produto':                   'organic_views',
  'visitantes':                           'organic_views',
  'impressoes':                           'organic_views',
  'page views':                           'organic_views',
  'product page views':                   'organic_views',

  // Conversões / pedidos orgânicos
  'pedidos':                              'organic_conversions',
  'numero de pedidos':                    'organic_conversions',
  'quantidade de pedidos':                'organic_conversions',
  'total de pedidos':                     'organic_conversions',
  'pedidos realizados':                   'organic_conversions',
  'orders':                               'organic_conversions',
  'total orders':                         'organic_conversions',

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

  // Faturamento via Ads (usado para calcular ROAS se ausente)
  'faturamento via anuncios':             'ads_revenue',
  'receita de anuncios':                  'ads_revenue',
  'ad revenue':                           'ads_revenue',
  'revenue from ads':                     'ads_revenue',
};

// ── Parser de número pt-BR → float ───────────────────────────────────────────
// Suporta: "1.234,56" → 1234.56 | "1234.56" → 1234.56 | "1,5" → 1.5

function parsePtBrNumber(raw: string): number {
  const s = (raw ?? '').replace(/[%\s]/g, '').trim();
  if (!s || s === '-' || s === 'N/A' || s === '--') return 0;
  // pt-BR format: ponto = milhar, vírgula = decimal
  if (s.includes(',')) {
    return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
  }
  return parseFloat(s) || 0;
}

// ── Server Action principal ───────────────────────────────────────────────────

export async function importShopeeCSV(
  rawRows: Record<string, string>[],
  shopId:  number,
): Promise<ImportResult> {
  if (!rawRows.length) return { imported: 0, skipped: 0, columns: [], error: 'Arquivo vazio' };
  if (!shopId || shopId === 0) return { imported: 0, skipped: 0, columns: [], error: 'Selecione a loja antes de importar' };

  // Detecta colunas presentes e faz mapeamento
  const headers     = Object.keys(rawRows[0]);
  const detectedCols: string[] = [];

  // headerIndex: nome original do CSV → campo da tabela
  const headerIndex = new Map<string, string>();
  for (const h of headers) {
    const normalizedHeader = norm(h);
    const field = COLUMN_MAP[normalizedHeader];
    if (field) {
      headerIndex.set(h, field);
      if (!detectedCols.includes(field)) detectedCols.push(field);
    }
  }

  console.log(`[importCsv] ${rawRows.length} linhas | mapeadas: ${[...headerIndex.values()].join(', ')}`);

  // Transforma linhas CSV em linhas de DB
  const toInsert: Record<string, unknown>[] = [];
  let skipped = 0;

  for (const row of rawRows) {
    const mapped: Record<string, unknown> = { shop_id: shopId };

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

    // Se ads_revenue existe mas roas_score não, calcula ROAS
    const spend  = Number(mapped['ads_spend']   ?? 0);
    const rev    = Number(mapped['ads_revenue']  ?? 0);
    const roas   = Number(mapped['roas_score']   ?? 0);
    if (roas === 0 && spend > 0 && rev > 0) {
      mapped['roas_score'] = parseFloat((rev / spend).toFixed(4));
    }

    // Remove campo auxiliar que não existe na tabela
    delete mapped['ads_revenue'];

    mapped['updated_at'] = new Date().toISOString();
    toInsert.push(mapped);
  }

  if (!toInsert.length) {
    return { imported: 0, skipped, columns: detectedCols, error: 'Nenhuma linha com SKU válido encontrada' };
  }

  const supabase = getSupabase();
  const { error: dbErr } = await supabase
    .from('shopee_performance_data')
    .upsert(toInsert as never[], { onConflict: 'shop_id,sku' });

  if (dbErr) {
    console.error('[importCsv] Supabase error:', dbErr.message);
    return { imported: 0, skipped, columns: detectedCols, error: dbErr.message };
  }

  console.log(`[importCsv] OK — ${toInsert.length} upserted, ${skipped} skipped`);
  revalidatePath('/dashboard/shopee-intelligence');
  return { imported: toInsert.length, skipped, columns: detectedCols };
}
