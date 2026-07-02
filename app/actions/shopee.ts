'use server';

import { revalidatePath } from 'next/cache';
import { getSupabase, getSupabasePublic } from '@/lib/supabase';
import { ShopeeMetricsRow, ShopeePerformanceRoasRow } from '@/types';

// Performance por campanha ingerida pelo webhook app/api/n8n/shopee-roas
// (espelho de getMlPerformance).
export async function getShopeePerformanceRoas(
  dateFrom?: string,
  dateTo?: string
): Promise<ShopeePerformanceRoasRow[]> {
  const supabase = getSupabasePublic();

  let query = supabase
    .from('shopee_performance_roas')
    .select('id, date, campaign_id, campaign_name, ad_spend, revenue, orders_count, impressions, clicks, account_name')
    .order('date', { ascending: false });

  if (dateFrom) query = query.gte('date', dateFrom);
  if (dateTo) query = query.lte('date', dateTo);

  const { data, error } = await query;

  if (error) {
    console.error('[getShopeePerformanceRoas]', error.message);
    return [];
  }

  return (data ?? []) as ShopeePerformanceRoasRow[];
}

export async function getShopeeMetrics(): Promise<ShopeeMetricsRow[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('shopee_metrics')
    .select(`
      id,
      campaign_id,
      date,
      ad_spend,
      revenue,
      roas,
      contribution_margin,
      campaigns (
        id,
        platform,
        name,
        status,
        daily_budget
      )
    `)
    .order('date', { ascending: false });

  if (error) {
    console.error('[getShopeeMetrics]', error.message);
    return [];
  }

  return (data ?? []) as unknown as ShopeeMetricsRow[];
}

export async function updateCampaignBudget(id: string, newBudget: number): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('campaigns')
    .update({ daily_budget: newBudget })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/');
}
