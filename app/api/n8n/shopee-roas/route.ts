import { NextRequest, NextResponse } from 'next/server';
import { getSupabasePublic } from '@/lib/supabase';
import { AccountName } from '@/types';

const VALID_ACCOUNTS: AccountName[] = ['momento', 'amariti', 'global'];

// Espelho do webhook ml-roas para a Shopee: o n8n envia um array de campanhas
// (1 linha por campanha por dia) e o upsert em (date, campaign_id, account_name)
// garante que reprocessar o mesmo dia atualiza em vez de duplicar.
interface ShopeeRoasPayload {
  date: string;
  campaign_name: string;
  ad_spend: number;
  revenue: number;
  // ID da campanha na API de Ads da Shopee — com date e account_name, forma a
  // chave de upsert.
  campaign_id?: number;
  // Conta da operação (multi-conta); ausente = 'momento' via default do banco.
  account_name?: AccountName;
  orders_count?: number;
  impressions?: number;
  clicks?: number;
}

function isValidRow(row: unknown): row is ShopeeRoasPayload {
  if (typeof row !== 'object' || row === null) return false;
  const r = row as Record<string, unknown>;
  return (
    typeof r.date === 'string' &&
    typeof r.campaign_name === 'string' &&
    typeof r.ad_spend === 'number' &&
    typeof r.revenue === 'number' &&
    (r.campaign_id === undefined || typeof r.campaign_id === 'number') &&
    (r.account_name === undefined || VALID_ACCOUNTS.includes(r.account_name as AccountName)) &&
    (r.orders_count === undefined || typeof r.orders_count === 'number') &&
    (r.impressions === undefined || typeof r.impressions === 'number') &&
    (r.clicks === undefined || typeof r.clicks === 'number')
  );
}

export async function POST(request: NextRequest) {
  const expectedKey = process.env.N8N_WEBHOOK_SECRET;
  const providedKey = request.headers.get('x-api-key');

  if (!expectedKey || !providedKey || providedKey !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido no corpo da requisição' }, { status: 400 });
  }

  if (!Array.isArray(body) || body.length === 0) {
    return NextResponse.json(
      { error: 'Corpo deve ser um array não vazio de campanhas' },
      { status: 400 }
    );
  }

  const rows = body.filter(isValidRow);
  if (rows.length === 0) {
    return NextResponse.json(
      { error: 'Nenhum registro válido — esperado: date, campaign_name, ad_spend, revenue' },
      { status: 400 }
    );
  }

  // Linhas sem campaign_id (NULL) nunca colidem no Postgres, então entram como
  // insert normal — mesmo comportamento do ml-roas.
  const supabase = getSupabasePublic();
  const { data, error } = await supabase
    .from('shopee_performance_roas')
    .upsert(
      rows.map((row) => ({
        ...row,
        account_name: row.account_name ?? 'momento',
        orders_count: row.orders_count ?? 0,
        impressions:  row.impressions ?? 0,
        clicks:       row.clicks ?? 0,
      })),
      { onConflict: 'date,campaign_id,account_name' }
    )
    .select('id');

  if (error) {
    console.error('[api/n8n/shopee-roas]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ upserted: data?.length ?? rows.length, skipped: body.length - rows.length });
}
