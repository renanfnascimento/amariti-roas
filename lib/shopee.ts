import crypto from 'crypto';

// ── Config ────────────────────────────────────────────────────────────────────

const BASE_URL = 'https://partner.shopeemobile.com';

interface ShopeeConfig {
  partnerId: number;
  partnerKey: string;
  shopId: number;
  accessToken: string;
}

function getConfig(): ShopeeConfig {
  return {
    partnerId:   Number((process.env.SHOPEE_PARTNER_ID   ?? '').trim() || '0'),
    partnerKey:  (process.env.SHOPEE_PARTNER_KEY          ?? '').trim(),
    shopId:      Number((process.env.SHOPEE_SHOP_ID       ?? '').trim() || '0'),
    accessToken: (process.env.SHOPEE_ACCESS_TOKEN         ?? '').trim(),
  };
}

// ── HMAC-SHA256 (Shopee Open Platform v2) ─────────────────────────────────────
// base_string = partner_id + path + timestamp + access_token + shop_id

function buildSign(path: string, timestamp: number, cfg: ShopeeConfig): string {
  const base = `${cfg.partnerId}${path}${timestamp}${cfg.accessToken}${cfg.shopId}`;
  return crypto.createHmac('sha256', cfg.partnerKey).update(base).digest('hex');
}

// ── Base fetch ────────────────────────────────────────────────────────────────

export async function fetchShopeeApi<T = unknown>(
  path: string,
  params: Record<string, string | number> = {},
): Promise<T> {
  const cfg = getConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const sign = buildSign(path, timestamp, cfg);

  const url = new URL(BASE_URL + path);
  url.searchParams.set('partner_id',   String(cfg.partnerId));
  url.searchParams.set('timestamp',    String(timestamp));
  url.searchParams.set('sign',         sign);
  url.searchParams.set('shop_id',      String(cfg.shopId));
  url.searchParams.set('access_token', cfg.accessToken);

  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error(`Shopee API [${path}] HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

// ── Tipos de retorno ──────────────────────────────────────────────────────────

export interface ShopeeItemPerformance {
  item_id:         number;
  item_name:       string;
  price:           number;
  impressions:     number;
  clicks:          number;
  orders:          number;
  units:           number;
  revenue:         number;
  product_visitors: number;
  cart_visitors:   number;
  ctr:             number;
  order_conv_rate: number;
  cart_conv_rate:  number;
}

// ── getShopeeItemPerformance ──────────────────────────────────────────────────

export async function getShopeeItemPerformance(
  dateFrom: string,
  dateTo: string,
): Promise<ShopeeItemPerformance[]> {

  // 1. Lista de itens ativos da loja
  const listRes = await fetchShopeeApi<{
    response?: { item?: Array<{ item_id: number; item_name?: string; price_info?: Array<{ current_price: number }> }> };
    error?: string; message?: string;
  }>('/api/v2/product/get_item_list', {
    offset: 0, page_size: 100, item_status: 'NORMAL',
  });

  if (listRes.error && listRes.error !== '') {
    throw new Error(`Item list error: ${listRes.message ?? listRes.error}`);
  }

  const items = listRes.response?.item ?? [];
  if (!items.length) return [];

  const priceMap = new Map(items.map((i) => [i.item_id, {
    name:  i.item_name ?? '',
    price: i.price_info?.[0]?.current_price ?? 0,
  }]));

  // 2. Business Insights por item — impressões, cliques, visitantes, pedidos
  const insightRes = await fetchShopeeApi<{
    response?: {
      business_insight?: Array<{
        item_id:              number;
        item_name?:           string;
        pv?:                  number; // page views / cliques
        uv?:                  number; // unique visitors
        add_to_cart_count?:   number;
        order_count?:         number;
        order_item_count?:    number;
        gmv?:                 number; // receita
        exposure_count?:      number; // impressões
      }>;
    };
    error?: string; message?: string;
  }>('/api/v2/analytics/get_shopee_business_insight', {
    date_from: dateFrom,
    date_to:   dateTo,
    page_size: 100,
    page_no:   0,
  });

  const insights = insightRes.response?.business_insight ?? [];

  return insights.map((row): ShopeeItemPerformance => {
    const base        = priceMap.get(row.item_id);
    const impressions = row.exposure_count  ?? 0;
    const clicks      = row.pv              ?? 0;
    const visitors    = row.uv              ?? 0;
    const cartVisitors = row.add_to_cart_count ?? 0;
    const orders      = row.order_count     ?? 0;
    const units       = row.order_item_count ?? 0;
    const revenue     = row.gmv             ?? 0;

    return {
      item_id:          row.item_id,
      item_name:        row.item_name ?? base?.name ?? '',
      price:            base?.price   ?? 0,
      impressions,
      clicks,
      orders,
      units,
      revenue,
      product_visitors: visitors,
      cart_visitors:    cartVisitors,
      ctr:              impressions > 0 ? (clicks      / impressions) * 100 : 0,
      order_conv_rate:  visitors   > 0 ? (orders      / visitors)    * 100 : 0,
      cart_conv_rate:   visitors   > 0 ? (cartVisitors / visitors)   * 100 : 0,
    };
  });
}
