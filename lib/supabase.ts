import { createClient } from '@supabase/supabase-js';

// Placeholder prevents "Invalid supabaseUrl" crash during Vercel static build.
// When real credentials are absent, createClient still succeeds; queries are
// short-circuited by the hasCredentials guard in each server action.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';

export const supabase = createClient(supabaseUrl, supabaseKey, { db: { schema: 'roas' } });

export const hasCredentials =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
