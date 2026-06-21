import { createClient } from '@supabase/supabase-js';

// Turbopack inlines missing NEXT_PUBLIC_* vars as the string "undefined",
// not JS undefined. Checking startsWith('https://') rejects every invalid
// value ("undefined", "", " ", etc.) and falls back to a dummy URL so
// createClient never throws during the Vercel static build phase.
const DUMMY_URL = 'https://dummyproject.supabase.co';
const DUMMY_KEY = 'dummy-anon-key';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

const safeUrl = rawUrl.startsWith('https://') ? rawUrl : DUMMY_URL;
const safeKey = rawKey.length > 20 ? rawKey : DUMMY_KEY;

export const supabase = createClient(safeUrl, safeKey, { db: { schema: 'roas' } });

export const hasCredentials = rawUrl.startsWith('https://') && rawKey.length > 20;
