'use server';

import { supabase } from '@/lib/supabase';
import { ShopeeProductData } from '@/types';

export async function getShopeeProducts(
  account = 'shopee-renan',
  dateFrom?: string,
  dateTo?: string,
): Promise<ShopeeProductData[]> {
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

  return (data ?? []).map((row: any) => ({
    shopee_product_id: row.shopee_product_id,
    product_name:      row.shopee_products?.name ?? '—',
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
