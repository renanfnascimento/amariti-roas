'use server';

import { getSupabasePublic } from '@/lib/supabase';
import { MarketCompetitor } from '@/types';

export async function getMarketCompetitors(): Promise<MarketCompetitor[]> {
  const supabase = getSupabasePublic();

  const { data, error } = await supabase
    .from('market_competitors_ml')
    .select('id, ml_item_id, title, price, thumbnail_url, sold_quantity, permalink, created_at, updated_at')
    .order('sold_quantity', { ascending: false });

  if (error) {
    console.error('[getMarketCompetitors]', error.message);
    return [];
  }

  return (data ?? []) as MarketCompetitor[];
}
