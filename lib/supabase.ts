import { createClient } from '@supabase/supabase-js';

// Lazy getter — createClient is called inside functions at request time,
// never at module evaluation (which runs during Vercel's build trace).
// startsWith('https://') rejects "undefined" string that Turbopack inlines
// for missing NEXT_PUBLIC_* vars, preventing the "malformed URL" crash.
export const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  const safeUrl = url?.startsWith('https://') ? url : 'https://placeholder.supabase.co';
  const safeKey = key && key.length > 20 ? key : 'placeholder-key';

  return createClient(safeUrl, safeKey, { db: { schema: 'roas' } });
};
