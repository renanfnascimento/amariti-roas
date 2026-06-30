'use server';

import { revalidatePath } from 'next/cache';
import { getSupabase, getSupabasePublic } from '@/lib/supabase';
import { getShopeeItemPerformance } from '@/lib/shopee';
import { ShopeeProductData } from '@/types';

// ── Leitura ───────────────────────────────────────────────────────────────────
// Schema real: shopee_product_metrics PK (product_id, shop_id, date)
//              shopee_products        PK (product_id, shop_id)

export async function getShopeeProducts(
  account = 'shopee-renan',
  dateFrom?: string,
  dateTo?: string,
  shopIndex: 1 | 2 = 1,
): Promise<ShopeeProductData[]> {
  try {
    const supabase = getSupabase();
    const shopId   = Number((process.env[`SHOPEE_SHOP_ID_${shopIndex}`] ?? '').trim() || '0');

    let query = supabase
      .from('shopee_product_metrics')
      .select(`
        product_id,
        shop_id,
        date,
        impressions,
        clicks,
        orders,
        visitors,
        shopee_products!fk_metrics_product(name, price, sku)
      `)
      .order('impressions', { ascending: false });

    if (shopId > 0) query = query.eq('shop_id', shopId);
    if (dateFrom)   query = query.gte('date', dateFrom);
    if (dateTo)     query = query.lte('date', dateTo);

    // Paginação: máximo 100 linhas por requisição (Shopee retorna até 100 items)
    const { data, error } = await query.range(0, 99);

    if (error) {
      console.error('ERRO REAL SSR:', error);
      return [];
    }

    // ── Cruzamento com estoque do Tiny (public.produtos) ──────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const skus = [...new Set(
      (data ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((r: any) => r.shopee_products?.sku as string | null | undefined)
        .filter((s): s is string => typeof s === 'string' && s.length > 0),
    )];

    console.log(`[cross-tiny:${account}] shopee_products retornou ${(data ?? []).length} métricas`);
    console.log(`[cross-tiny:${account}] SKUs vinculados (roas.shopee_products.sku): ${skus.length}`, skus.slice(0, 5));

    const estoqueMap = new Map<string, number>();
    if (skus.length > 0) {
      // Usa cliente 'public' dedicado — evita conflito com schema padrão 'roas'
      const supabasePublic = getSupabasePublic();
      const { data: estoqueRows, error: estoqueErr } = await supabasePublic
        .from('produtos')
        .select('sku, stock')
        .in('sku', skus);

      if (estoqueErr) {
        console.error('[cross-tiny] ERRO ao buscar public.produtos:', estoqueErr.message);
      } else {
        console.log(`[cross-tiny:${account}] Encontrados ${estoqueRows?.length ?? 0} registros em public.produtos`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (estoqueRows ?? []).forEach((r: any) => {
          if (r.sku) estoqueMap.set(r.sku, r.stock ?? 0);
        });
      }
    } else {
      console.log(`[cross-tiny:${account}] Nenhum SKU vinculado em roas.shopee_products — preencha a coluna sku para ativar o cruzamento`);
    }

    // ── Cruzamento com diagnóstico do relatório Shopee (roas.shopee_performance_data) ──
    const diagMap = new Map<string, string>();
    if (skus.length > 0) {
      const { data: diagRows, error: diagErr } = await supabase
        .from('shopee_performance_data')
        .select('sku, shopee_diagnosis')
        .in('sku', skus)
        .not('shopee_diagnosis', 'is', null);

      if (diagErr) {
        console.error('[cross-diag] ERRO ao buscar diagnóstico:', diagErr.message);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (diagRows ?? []).forEach((r: any) => {
          if (r.sku && r.shopee_diagnosis) diagMap.set(r.sku, r.shopee_diagnosis);
        });
        console.log(`[cross-diag:${account}] ${diagMap.size} SKUs com diagnóstico Shopee`);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((row: any) => {
      const sku: string | null = row.shopee_products?.sku ?? null;
      return {
        shopee_product_id: String(row.product_id),
        product_name:      row.shopee_products?.name  ?? '—',
        price:             row.shopee_products?.price ?? 0,
        account,
        date:              row.date,
        impressions:       row.impressions    ?? 0,
        clicks:            row.clicks         ?? 0,
        orders:            row.orders         ?? 0,
        units:             0,
        product_visitors:  row.visitors       ?? 0,
        cart_visitors:     0,
        revenue:           0,
        ctr:               (row.impressions ?? 0) > 0
                             ? ((row.clicks ?? 0) / row.impressions) * 100
                             : 0,
        order_conv_rate:   (row.visitors ?? 0) > 0
                             ? ((row.orders ?? 0) / row.visitors) * 100
                             : 0,
        cart_conv_rate:    0,
        sku,
        estoque_tiny: sku !== null && estoqueMap.has(sku)
          ? estoqueMap.get(sku)!
          : null,
        shopee_diagnosis: sku !== null && diagMap.has(sku)
          ? diagMap.get(sku)!
          : null,
      };
    });

  } catch (error) {
    console.error('ERRO REAL SSR:', error);
    return [];
  }
}

// ── Sincronização com a Shopee Open Platform ──────────────────────────────────

export async function syncShopeeProductsData(
  account = 'shopee-renan',
  shopIndex: 1 | 2 = 1,
  dateFrom?: string,
  dateTo?: string,
): Promise<{ synced: number; error?: string; timing?: Record<string, number> }> {
  const today   = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const from    = dateFrom ?? weekAgo;
  const to      = dateTo   ?? today;

  const shopId = Number((process.env[`SHOPEE_SHOP_ID_${shopIndex}`] ?? '').trim() || '0');
  const timing: Record<string, number> = {};

  try {
    // ── Chamada à Shopee API ──────────────────────────────────────────────────
    const t0 = Date.now();
    console.time(`[sync:${account}] shopee-api`);

    const items = await getShopeeItemPerformance(from, to, shopIndex);

    const apiMs = Date.now() - t0;
    console.timeEnd(`[sync:${account}] shopee-api`);
    console.log(`[sync:${account}] shopee-api retornou ${items.length} itens em ${apiMs}ms`);
    timing.shopeeApiMs = apiMs;

    if (!items.length) return { synced: 0, timing };

    const supabase = getSupabase();

    // ── Upsert no Supabase ────────────────────────────────────────────────────
    const t1 = Date.now();
    console.time(`[sync:${account}] supabase-upsert`);

    // Produtos — chave composta (product_id, shop_id)
    const { error: prodErr } = await supabase
      .from('shopee_products')
      .upsert(
        items.map((i) => ({
          product_id: i.item_id,
          shop_id:    shopId,
          name:       i.item_name,
          price:      i.price,
        })),
        { onConflict: 'product_id,shop_id' },
      );

    if (prodErr) throw new Error(prodErr.message);

    // Métricas — chave composta (product_id, shop_id, date)
    const { error: metErr } = await supabase
      .from('shopee_product_metrics')
      .upsert(
        items.map((i) => ({
          product_id:  i.item_id,
          shop_id:     shopId,
          date:        to,
          impressions: i.impressions,
          clicks:      i.clicks,
          orders:      i.orders,
          visitors:    i.product_visitors,
        })),
        { onConflict: 'product_id,shop_id,date' },
      );

    if (metErr) throw new Error(metErr.message);

    const dbMs = Date.now() - t1;
    console.timeEnd(`[sync:${account}] supabase-upsert`);
    console.log(`[sync:${account}] supabase-upsert concluído em ${dbMs}ms`);
    timing.supabaseMs = dbMs;

    console.log(`[sync:${account}] TOTAL ${timing.shopeeApiMs + timing.supabaseMs}ms | API ${timing.shopeeApiMs}ms | DB ${timing.supabaseMs}ms`);

    revalidatePath('/shopee-ads');
    return { synced: items.length, timing };

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error(`[sync:${account}]`, msg);
    return { synced: 0, error: msg, timing };
  }
}
