'use server';

import { revalidatePath } from 'next/cache';
import { getSupabase } from '@/lib/supabase';
import { getShopeeItemPerformance } from '@/lib/shopee';
import { ShopeeProductData } from '@/types';

// ── Leitura ───────────────────────────────────────────────────────────────────

export async function getShopeeProducts(
  account = 'shopee-renan',
  dateFrom?: string,
  dateTo?: string,
): Promise<ShopeeProductData[]> {
  const supabase = getSupabase();

  let query = supabase
    .from('shopee_product_metrics')
    .select(`
      shopee_product_id,
      account,
      date,
      impressions,
      clicks,
      orders,
      units,
      product_visitors,
      cart_visitors,
      revenue,
      ctr,
      order_conv_rate,
      cart_conv_rate,
      shopee_products!inner(name, price)
    `)
    .eq('account', account)
    .order('impressions', { ascending: false });

  if (dateFrom) query = query.gte('date', dateFrom);
  if (dateTo)   query = query.lte('date', dateTo);

  const { data, error } = await query;

  if (error) {
    console.error('[getShopeeProducts]', error.message);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    shopee_product_id: row.shopee_product_id,
    product_name:      row.shopee_products?.name  ?? '—',
    price:             row.shopee_products?.price ?? 0,
    account:           row.account,
    date:              row.date,
    impressions:       row.impressions,
    clicks:            row.clicks,
    orders:            row.orders,
    units:             row.units,
    product_visitors:  row.product_visitors,
    cart_visitors:     row.cart_visitors,
    revenue:           row.revenue,
    ctr:               row.ctr,
    order_conv_rate:   row.order_conv_rate,
    cart_conv_rate:    row.cart_conv_rate,
  }));
}

// ── Sincronização com a Shopee Open Platform ──────────────────────────────────

export async function syncShopeeProductsData(
  account = 'shopee-renan',
  dateFrom?: string,
  dateTo?: string,
): Promise<{ synced: number; error?: string }> {
  const today    = new Date().toISOString().split('T')[0];
  const weekAgo  = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const from     = dateFrom ?? weekAgo;
  const to       = dateTo   ?? today;

  try {
    const items = await getShopeeItemPerformance(from, to);
    if (!items.length) return { synced: 0 };

    const supabase = getSupabase();

    // Upsert produtos (dimensão)
    const { error: prodErr } = await supabase
      .from('shopee_products')
      .upsert(
        items.map((i) => ({
          shopee_product_id: String(i.item_id),
          name:              i.item_name,
          price:             i.price,
        })),
        { onConflict: 'shopee_product_id' },
      );

    if (prodErr) throw new Error(prodErr.message);

    // Upsert métricas (fatos por dia)
    const { error: metErr } = await supabase
      .from('shopee_product_metrics')
      .upsert(
        items.map((i) => ({
          shopee_product_id: String(i.item_id),
          account,
          date:              to,
          impressions:       i.impressions,
          clicks:            i.clicks,
          orders:            i.orders,
          units:             i.units,
          product_visitors:  i.product_visitors,
          cart_visitors:     i.cart_visitors,
          revenue:           i.revenue,
          ctr:               i.ctr,
          order_conv_rate:   i.order_conv_rate,
          cart_conv_rate:    i.cart_conv_rate,
        })),
        { onConflict: 'shopee_product_id,date' },
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
