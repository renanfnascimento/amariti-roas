'use server';

import { revalidatePath } from 'next/cache';
import { getSupabase } from '@/lib/supabase';
import { getShopeeItemPerformance } from '@/lib/shopee';
import { ShopeeProductData } from '@/types';

// ── Leitura ───────────────────────────────────────────────────────────────────
// Schema real: shopee_product_metrics.product_id BIGINT FK → shopee_products.product_id
// Campo de visitantes na tabela: "visitors" (não "product_visitors")

export async function getShopeeProducts(
  account = 'shopee-renan',
  dateFrom?: string,
  dateTo?: string,
): Promise<ShopeeProductData[]> {
  try {
    const supabase = getSupabase();

    let query = supabase
      .from('shopee_product_metrics')
      .select(`
        product_id,
        date,
        impressions,
        clicks,
        orders,
        visitors,
        shopee_products!inner(name, price)
      `)
      .order('impressions', { ascending: false });

    if (dateFrom) query = query.gte('date', dateFrom);
    if (dateTo)   query = query.lte('date', dateTo);

    const { data, error } = await query;

    if (error) {
      console.error('ERRO REAL SSR:', error);
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((row: any) => ({
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
    }));

  } catch (error) {
    console.error('ERRO REAL SSR:', error);
    return [];
  }
}

// ── Sincronização com a Shopee Open Platform ──────────────────────────────────

export async function syncShopeeProductsData(
  account = 'shopee-renan',
  dateFrom?: string,
  dateTo?: string,
): Promise<{ synced: number; error?: string }> {
  const today   = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const from    = dateFrom ?? weekAgo;
  const to      = dateTo   ?? today;

  try {
    const items = await getShopeeItemPerformance(from, to);
    if (!items.length) return { synced: 0 };

    const supabase = getSupabase();

    // Upsert produtos — product_id BIGINT é a chave real no Supabase
    const { error: prodErr } = await supabase
      .from('shopee_products')
      .upsert(
        items.map((i) => ({
          product_id: i.item_id,      // BIGINT — número direto da Shopee
          name:       i.item_name,
          price:      i.price,
        })),
        { onConflict: 'product_id' },
      );

    if (prodErr) throw new Error(prodErr.message);

    // Upsert métricas — chave: (product_id, date)
    const { error: metErr } = await supabase
      .from('shopee_product_metrics')
      .upsert(
        items.map((i) => ({
          product_id:  i.item_id,
          date:        to,
          impressions: i.impressions,
          clicks:      i.clicks,
          orders:      i.orders,
          visitors:    i.product_visitors,   // "visitors" = coluna real na tabela
        })),
        { onConflict: 'product_id,date' },
      );

    if (metErr) throw new Error(metErr.message);

    revalidatePath('/shopee-ads');
    return { synced: items.length };

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[syncShopeeProductsData]', msg);
    return { synced: 0, error: msg };
  }
}
