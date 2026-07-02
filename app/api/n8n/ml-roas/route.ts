import { NextRequest, NextResponse } from 'next/server';
import { getSupabasePublic } from '@/lib/supabase';
import { MlTrafficSource } from '@/types';

interface MlRoasPayload {
  date: string;
  campaign_name: string;
  ad_spend: number;
  revenue: number;
  orders_count: number;
  traffic_source?: MlTrafficSource;
  // Opcionais: alimentam o CTR do Centro de Comando de CRO (prints/clicks
  // por campanha na API de Ads do ML).
  impressions?: number;
  clicks?: number;
}

function isValidRow(row: unknown): row is MlRoasPayload {
  if (typeof row !== 'object' || row === null) return false;
  const r = row as Record<string, unknown>;
  return (
    typeof r.date === 'string' &&
    typeof r.campaign_name === 'string' &&
    typeof r.ad_spend === 'number' &&
    typeof r.revenue === 'number' &&
    typeof r.orders_count === 'number' &&
    (r.traffic_source === undefined || r.traffic_source === 'ads' || r.traffic_source === 'organic') &&
    (r.impressions === undefined || typeof r.impressions === 'number') &&
    (r.clicks === undefined || typeof r.clicks === 'number')
  );
}

// n8n envia campanhas de Mercado Ads (com ad_spend > 0) e o volume de vendas
// orgânicas (ad_spend = 0) no mesmo lote. Quando traffic_source não vem
// explícito no payload, infere a partir do investimento.
function resolveTrafficSource(row: MlRoasPayload): MlTrafficSource {
  return row.traffic_source ?? (row.ad_spend === 0 ? 'organic' : 'ads');
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
      { error: 'Corpo deve ser um array não vazio de registros' },
      { status: 400 }
    );
  }

  const rows = body.filter(isValidRow).map((row) => ({
    ...row,
    traffic_source: resolveTrafficSource(row),
  }));
  if (rows.length === 0) {
    return NextResponse.json(
      { error: 'Nenhum registro válido — esperado: date, campaign_name, ad_spend, revenue, orders_count' },
      { status: 400 }
    );
  }

  const supabase = getSupabasePublic();
  const { data, error } = await supabase.from('ml_performance_roas').insert(rows).select('id');

  if (error) {
    console.error('[api/n8n/ml-roas]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ inserted: data?.length ?? rows.length, skipped: body.length - rows.length });
}
