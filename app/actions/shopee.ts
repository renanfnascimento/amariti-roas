'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { ShopeeMetricsRow } from '@/types';

export async function getShopeeMetrics(): Promise<ShopeeMetricsRow[]> {
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
  const { error } = await supabase
    .from('campaigns')
    .update({ daily_budget: newBudget })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/');
}
