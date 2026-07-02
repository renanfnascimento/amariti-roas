import { MlPerformanceRow, TrafficPerformanceAdsRow } from '@/types';

// ── Modelo unificado do Centro de Comando ──────────────────────────────────────
// Junta as duas fontes (campanhas de ml_performance_roas + agregados diários de
// traffic_performance_ads) num único formato que o motor de regras entende.

export interface CroRow {
  id:           string;
  name:         string;
  date:         string;
  source:       'ads' | 'organic';
  ad_spend:     number;
  revenue:      number;
  orders_count: number;
  impressions:  number;
  clicks:       number;
  // Linhas vindas de ml_performance_roas podem ser editadas pelo QuickEditMlDialog.
  editable:     boolean;
}

export interface CroMetrics {
  roas:           number;
  ctr:            number; // %
  conversionRate: number; // % (pedidos / cliques)
}

export type CroAlertKind = 'escala' | 'gargalo' | 'pausa' | 'mina_de_ouro';

export interface CroAlert {
  kind:           CroAlertKind;
  label:          string;
  recommendation: string;
}

export function computeCroMetrics(row: CroRow): CroMetrics {
  return {
    roas:           row.ad_spend > 0 ? row.revenue / row.ad_spend : 0,
    ctr:            row.impressions > 0 ? (row.clicks / row.impressions) * 100 : 0,
    conversionRate: row.clicks > 0 ? (row.orders_count / row.clicks) * 100 : 0,
  };
}

// ── Regras estritas de decisão (ordem = severidade) ────────────────────────────
// PAUSA vem antes de GARGALO/ESCALA: se está queimando verba, nada mais importa.

export function classifyCroRow(row: CroRow): CroAlert | null {
  const { roas, ctr, conversionRate } = computeCroMetrics(row);

  if (row.source === 'organic') {
    // MINA DE OURO: orgânico puro com vendas consistentes (3+ pedidos no período).
    if (row.orders_count >= 3 && row.revenue > 0) {
      return {
        kind: 'mina_de_ouro',
        label: 'Mina de Ouro',
        recommendation:
          'Produto viralizando organicamente. Crie campanha de Ads para tracionar.',
      };
    }
    return null;
  }

  // ALERTA PAUSA: ROAS < 4.0 e custo > R$ 50 — desperdício direto de verba.
  if (roas < 4.0 && row.ad_spend > 50) {
    return {
      kind: 'pausa',
      label: 'Pausar',
      recommendation: 'Desperdiçando verba. Pausar campanha imediatamente.',
    };
  }

  // ALERTA GARGALO: CTR alto (> 2.5%) mas conversão baixa ou ROAS < 4.0 —
  // o anúncio atrai, a página não fecha a venda.
  if (ctr > 2.5 && (roas < 4.0 || conversionRate < 1.0)) {
    return {
      kind: 'gargalo',
      label: 'Gargalo de Conversão',
      recommendation:
        'Atenção: Tráfego qualificado, mas não converte. Verifique ruptura de estoque, falha no preço ou fotos da peça.',
    };
  }

  // ALERTA ESCALA: ROAS > 7.0 e CTR > 2% — máquina de lucro validada.
  if (roas > 7.0 && ctr > 2.0) {
    return {
      kind: 'escala',
      label: 'Escalar',
      recommendation: 'Campanha vencedora. Aumentar orçamento.',
    };
  }

  return null;
}

// ── Adaptadores das fontes de dados ────────────────────────────────────────────

export function buildCroRows(
  campaignRows: MlPerformanceRow[],
  trafficRows: TrafficPerformanceAdsRow[]
): CroRow[] {
  const fromCampaigns: CroRow[] = campaignRows.map((r) => ({
    id:           r.id,
    name:         r.campaign_name,
    date:         r.date,
    source:       r.traffic_source === 'organic' ? 'organic' : 'ads',
    ad_spend:     r.ad_spend,
    revenue:      r.revenue,
    orders_count: r.orders_count,
    impressions:  r.impressions ?? 0,
    clicks:       r.clicks ?? 0,
    editable:     true,
  }));

  // Agregados diários do n8n: só o lado orgânico entra na matriz — o lado de
  // Ads já está representado campanha a campanha acima, e duplicá-lo inflaria
  // os totais e geraria alertas repetidos.
  const fromTraffic: CroRow[] = trafficRows
    .filter((r) => r.traffic_source === 'ml_organico')
    .map((r) => ({
      id:           r.id,
      name:         'Tráfego Orgânico ML (dia)',
      date:         r.date,
      source:       'organic' as const,
      ad_spend:     0,
      revenue:      r.revenue,
      orders_count: r.orders_count,
      impressions:  r.impressions ?? 0,
      clicks:       r.clicks ?? 0,
      editable:     false,
    }));

  return [...fromCampaigns, ...fromTraffic];
}
