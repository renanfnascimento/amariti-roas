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
