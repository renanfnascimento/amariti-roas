'use server';

import { revalidatePath } from 'next/cache';
import { getSupabasePublic } from '@/lib/supabase';
import { MlPerformanceRow } from '@/types';

export async function getMlPerformance(
  dateFrom?: string,
  dateTo?: string
): Promise<MlPerformanceRow[]> {
  const supabase = getSupabasePublic();

  let query = supabase
    .from('ml_performance_roas')
    .select('id, date, campaign_name, ad_spend, revenue, orders_count, traffic_source')
    .order('date', { ascending: false });

  if (dateFrom) query = query.gte('date', dateFrom);
  if (dateTo) query = query.lte('date', dateTo);

  const { data, error } = await query;

  if (error) {
    console.error('[getMlPerformance]', error.message);
    return [];
  }

  return (data ?? []) as MlPerformanceRow[];
}

export async function updateMlPerformance(
  id: string,
  updates: { ad_spend: number; revenue: number }
): Promise<void> {
  const supabase = getSupabasePublic();

  const { error } = await supabase
    .from('ml_performance_roas')
    .update(updates)
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/vendas-ml');
}
