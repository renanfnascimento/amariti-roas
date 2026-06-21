import { createClient } from '@supabase/supabase-js';

const getUrl = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && url.trim() !== '' ? url : 'https://dummyproject.supabase.co';
};

const getKey = () => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return key && key.trim() !== '' ? key : 'dummy-anon-key';
};

export const supabase = createClient(getUrl(), getKey(), { db: { schema: 'roas' } });

export const hasCredentials =
  !!(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) &&
  !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim());
