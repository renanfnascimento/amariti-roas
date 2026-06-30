'use server';

import { revalidatePath } from 'next/cache';
import { getSupabase } from '@/lib/supabase';
import { CrmProduto, CrmStatus } from '@/types';

export async function getCrmProdutos(): Promise<CrmProduto[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('vw_crm_produtos')
    .select('*')
    .order('total_impressions', { ascending: false });

  if (error) {
    console.error('[getCrmProdutos]', error.message);
    return [];
  }

  return (data ?? []) as CrmProduto[];
}

export async function updateProdutoStatus(
  productId: number,
  shopId: number,
  status: CrmStatus,
): Promise<{ error?: string }> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('shopee_products')
    .update({ status, ciclo_inicio: new Date().toISOString().split('T')[0] })
    .eq('product_id', productId)
    .eq('shop_id', shopId);

  if (error) return { error: error.message };
  revalidatePath('/crm-anuncios');
  return {};
}

export async function registrarTrocaFoto(
  productId: number,
  shopId: number,
): Promise<{ error?: string }> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('shopee_products')
    .update({ ultima_alteracao_foto: new Date().toISOString().split('T')[0] })
    .eq('product_id', productId)
    .eq('shop_id', shopId);

  if (error) return { error: error.message };
  revalidatePath('/crm-anuncios');
  return {};
}

export async function updateCampaignId(
  productId: number,
  shopId: number,
  campaignId: string,
): Promise<{ error?: string }> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('shopee_products')
    .update({ campaign_id: campaignId.trim() || null })
    .eq('product_id', productId)
    .eq('shop_id', shopId);

  if (error) return { error: error.message };
  revalidatePath('/crm-anuncios');
  return {};
}
