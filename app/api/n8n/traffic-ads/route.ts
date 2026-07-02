import { NextRequest, NextResponse } from 'next/server';
import { getSupabasePublic } from '@/lib/supabase';
import { TrafficAdsSource } from '@/types';

interface TrafficAdsPayload {
  date: string;
  traffic_source: TrafficAdsSource;
  ad_spend: number;
  revenue: number;
  orders_count: number;
}

function isValidRow(row: unknown): row is TrafficAdsPayload {
  if (typeof row !== 'object' || row === null) return false;
  const r = row as Record<string, unknown>;
  return (
    typeof r.date === 'string' &&
    (r.traffic_source === 'ml_ads' || r.traffic_source === 'ml_organico') &&
    typeof r.ad_spend === 'number' &&
    typeof r.revenue === 'number' &&
    typeof r.orders_count === 'number'
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

  const items = Array.isArray(body) ? body : [body];
  const rows = items.filter(isValidRow);

  if (rows.length === 0) {
    return NextResponse.json(
      {
        error:
          'Nenhum registro válido — esperado: date, traffic_source ("ml_ads" | "ml_organico"), ad_spend, revenue, orders_count',
      },
      { status: 400 }
    );
  }

  const supabase = getSupabasePublic();
  const { data, error } = await supabase
    .from('traffic_performance_ads')
    .upsert(rows, { onConflict: 'date,traffic_source' })
    .select('id');

  if (error) {
    console.error('[api/n8n/traffic-ads]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ upserted: data?.length ?? rows.length, skipped: items.length - rows.length });
}
