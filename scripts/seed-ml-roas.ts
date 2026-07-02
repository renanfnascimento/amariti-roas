// Seed de teste para o painel Performance e ROAS - Mercado Livre.
//
// Pré-requisitos (uma vez só, no projeto dndnamqwnaguvuzvobrv):
//   1. Rodar supabase/migrations/20260702_create_ml_performance_roas.sql no SQL Editor.
//   2. Em Project Settings > API > Data API > Exposed schemas, adicionar "roas"
//      (sem isso o PostgREST recusa qualquer request para o schema com "Invalid schema: roas",
//      mesmo com a tabela e as policies corretas).
// Este script não roda DDL, apenas insere linhas.
//
// Uso:
//   node --env-file=env.local scripts/seed-ml-roas.ts

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!url?.startsWith('https://') || !key || key.length < 20) {
  console.error(
    'Faltam credenciais do Supabase. Rode com: node --env-file=env.local scripts/seed-ml-roas.ts'
  );
  process.exit(1);
}

const supabase = createClient(url, key, { db: { schema: 'roas' } });

interface SeedRow {
  date: string;
  campaign_name: string;
  ad_spend: number;
  revenue: number;
  orders_count: number;
}

// ad_spend/revenue calibrados para bater exatamente no ROAS (revenue / ad_spend) pedido.
const SEED_ROWS: SeedRow[] = [
  { date: '2026-07-02', campaign_name: 'Kits Atacado',           ad_spend: 320, revenue: 2720, orders_count: 38 }, // ROAS 8.5 — Verde
  { date: '2026-07-01', campaign_name: 'Vestidos Sereia Renda',  ad_spend: 450, revenue: 2340, orders_count: 22 }, // ROAS 5.2 — Amarelo
  { date: '2026-06-30', campaign_name: 'Calça Jogger Crepe',     ad_spend: 680, revenue: 1428, orders_count: 27 }, // ROAS 2.1 — Vermelho
  { date: '2026-06-29', campaign_name: 'Cropped Suplex',         ad_spend: 390, revenue: 1755, orders_count: 31 }, // ROAS 4.5 — Amarelo
  { date: '2026-06-28', campaign_name: 'Vestidos Gola Alta',     ad_spend: 340, revenue: 2652, orders_count: 29 }, // ROAS 7.8 — Verde
];

async function main() {
  const { data, error } = await supabase
    .from('ml_performance_roas')
    .insert(SEED_ROWS)
    .select('id, campaign_name');

  if (error) {
    console.error('[seed-ml-roas] Falha ao inserir:', error.message);
    process.exitCode = 1;
    return;
  }

  console.log(`[seed-ml-roas] ${data?.length ?? 0} registros inseridos:`);
  for (const row of data ?? []) {
    console.log(`  - ${row.campaign_name} (${row.id})`);
  }
}

main();
