import { createClient } from '@supabase/supabase-js';

function getConnectionParams() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return {
    safeUrl: url?.startsWith('https://') ? url : 'https://placeholder.supabase.co',
    safeKey: key && key.length > 20 ? key : 'placeholder-key',
  };
}

// Cliente padrão para o schema 'roas' (métricas e produtos Shopee)
export const getSupabase = () => {
  const { safeUrl, safeKey } = getConnectionParams();
  return createClient(safeUrl, safeKey, { db: { schema: 'roas' } });
};

// Cliente para o schema 'public' (produtos Tiny, PCP, financeiro)
export const getSupabasePublic = () => {
  const { safeUrl, safeKey } = getConnectionParams();
  return createClient(safeUrl, safeKey); // schema padrão = 'public'
};
