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
