import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Client é null se as variáveis não estiverem presentes (ex: build sem env vars na Vercel).
// Cada server action verifica this before use.
export const supabase = url && key
  ? createClient(url, key, { db: { schema: 'roas' } })
  : null;
