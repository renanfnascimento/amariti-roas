import { NextRequest, NextResponse } from 'next/server';
import { getSupabasePublic } from '@/lib/supabase';

interface MarketCompetitorPayload {
  ml_item_id: string;
  title: string;
  price: number | string;
  thumbnail_url?: string;
  // A API do ML ora devolve número exato, ora faixa em string ("500+") —
  // aceita ambos e normaliza para inteiro no banco.
  sold_quantity?: number | string;
  permalink?: string;
}

function isValidRow(row: unknown): row is MarketCompetitorPayload {
  if (typeof row !== 'object' || row === null) return false;
  const r = row as Record<string, unknown>;
  return (
    typeof r.ml_item_id === 'string' && r.ml_item_id.length > 0 &&
    typeof r.title === 'string' && r.title.length > 0 &&
    (typeof r.price === 'number' || (typeof r.price === 'string' && !Number.isNaN(Number(r.price)))) &&
    (r.thumbnail_url === undefined || typeof r.thumbnail_url === 'string') &&
    (r.sold_quantity === undefined || typeof r.sold_quantity === 'number' || typeof r.sold_quantity === 'string') &&
    (r.permalink === undefined || typeof r.permalink === 'string')
  );
}

function parseSoldQuantity(value: number | string | undefined): number {
  if (value === undefined) return 0;
  if (typeof value === 'number') return Math.max(0, Math.trunc(value));
  // Faixas como "500+" ou "mais de 500" viram o número contido na string.
  const digits = value.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
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
      { error: 'Corpo deve ser um array não vazio de concorrentes' },
      { status: 400 }
    );
  }

  const rows = body.filter(isValidRow).map((row) => ({
    ml_item_id:    row.ml_item_id,
    title:         row.title,
    price:         Number(row.price),
    thumbnail_url: row.thumbnail_url ?? null,
    sold_quantity: parseSoldQuantity(row.sold_quantity),
    permalink:     row.permalink ?? null,
  }));

  if (rows.length === 0) {
    return NextResponse.json(
      { error: 'Nenhum registro válido — esperado: ml_item_id, title, price (+ thumbnail_url, sold_quantity, permalink opcionais)' },
      { status: 400 }
    );
  }

  // Upsert em ml_item_id: recargas do n8n atualizam preço/vendas do mesmo
  // anúncio em vez de duplicar; updated_at é mantido por trigger no banco.
  const supabase = getSupabasePublic();
  const { data, error } = await supabase
    .from('market_competitors_ml')
    .upsert(rows, { onConflict: 'ml_item_id' })
    .select('id');

  if (error) {
    console.error('[api/n8n/mercado-concorrencia]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ upserted: data?.length ?? rows.length, skipped: body.length - rows.length });
}
