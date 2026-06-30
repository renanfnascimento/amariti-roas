export type Platform = 'SHOPEE' | 'META_ADS' | 'TIKTOK_ADS' | 'GOOGLE_ADS';

export interface Campaign {
  id: string;
  platform: Platform;
  nome_campanha: string;
  status_ativo: boolean;
  orcamento_diario: number;
}

export interface ShopeeMetrics {
  id: string;
  campaign_id: string;
  data: string;
  valor_gasto_ads: number;
  valor_faturado: number;
  roas_calculado: number;
  margem_contribuicao: number;
}

export interface ShopeeMetricsRow {
  id: string;
  campaign_id: string;
  date: string;
  ad_spend: number;
  revenue: number;
  roas: number;
  contribution_margin: number;
  campaigns: {
    id: string;
    platform: string;
    name: string;
    status: boolean;
    daily_budget: number;
  };
}

// ── Produto Analytics ─────────────────────────────────────────────────────────

export interface ShopeeProductData {
  shopee_product_id: string;
  product_name: string;
  price: number;
  account: string;
  date: string;
  impressions: number;
  clicks: number;
  orders: number;
  units: number;
  product_visitors: number;
  cart_visitors: number;
  revenue: number;
  ctr: number;
  order_conv_rate: number;
  cart_conv_rate: number;
  // Cruzamento Tiny — null quando SKU ainda não vinculado
  sku:              string | null;
  estoque_tiny:     number | null;
  // Diagnóstico importado do relatório Shopee (.xlsx)
  shopee_diagnosis: string | null;
}

export type DiagnosisType = 'critical' | 'warning' | 'ok';

export interface Diagnosis {
  type: DiagnosisType;
  category: 'ctr' | 'conversion' | 'cart' | 'volume';
  label: string;
  action: string;
  icon: string;
}

// ── CRM de Anúncios ───────────────────────────────────────────────────────────

export type CrmStatus = 'incubacao' | 'otimizacao' | 'escala' | 'descarte';

export interface CrmProduto {
  product_id:           number;
  shop_id:              number;
  name:                 string;
  price:                number;
  status:               CrmStatus;
  status_sugerido:      CrmStatus;
  ciclo_inicio:         string | null;
  ultima_alteracao_foto: string | null;
  platform_id:          string | null;
  campaign_id:          string | null;
  dias_no_ciclo:        number;
  total_impressions:    number;
  total_clicks:         number;
  total_orders:         number;
  total_visitors:       number;
  ctr:                  number;
  conv_rate:            number;
}

export function analyzeProduct(p: ShopeeProductData): Diagnosis[] {
  const result: Diagnosis[] = [];

  // CTR — analisar só com volume >= 100 impressões
  if (p.impressions >= 100) {
    if (p.ctr < 2.0) {
      result.push({ type: 'critical', category: 'ctr',
        label: 'CTR Crítico', action: 'Trocar foto de capa urgente', icon: '📸' });
    } else if (p.ctr < 4.0) {
      result.push({ type: 'warning', category: 'ctr',
        label: 'CTR Baixo', action: 'Testar nova capa ou título', icon: '🖼️' });
    }
  }

  // Conversão de Pedidos — com >= 20 cliques
  if (p.clicks >= 20) {
    if (p.order_conv_rate < 1.0) {
      result.push({ type: 'critical', category: 'conversion',
        label: 'Conv. Crítica', action: 'Verificar estoque e sazonalidade', icon: '📦' });
    } else if (p.order_conv_rate < 2.5) {
      result.push({ type: 'warning', category: 'conversion',
        label: 'Conv. Baixa', action: 'Revisar preço ou descrição', icon: '💰' });
    }
  }

  // Abandono de carrinho — com >= 5 adições e conv baixa
  if (p.cart_visitors >= 5) {
    const cartToPurchase = p.cart_visitors > 0
      ? (p.orders / p.cart_visitors) * 100
      : 0;
    if (cartToPurchase < 20) {
      result.push({ type: 'warning', category: 'cart',
        label: 'Abandono Carrinho', action: 'Revisar frete e parcelamento', icon: '🛒' });
    }
  }

  // Volume muito baixo — sem diagnóstico de CTR/Conv confiável
  if (p.impressions > 0 && p.impressions < 100 && result.length === 0) {
    result.push({ type: 'ok', category: 'volume',
      label: 'Volume Baixo', action: 'Aguardar mais dados', icon: '📊' });
  }

  return result;
}
