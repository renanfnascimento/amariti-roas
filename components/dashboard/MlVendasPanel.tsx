'use client';

import { useMemo } from 'react';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { MlDateRangeFilter } from '@/components/MlDateRangeFilter';
import { MlPerformanceChart } from '@/components/dashboard/MlPerformanceChart';
import { ActionableInsightsFeed } from '@/components/dashboard/ActionableInsightsFeed';
import { CroPipelineBoard } from '@/components/dashboard/CroPipelineBoard';
import { SmartMatrixTable } from '@/components/SmartMatrixTable';
import { TrafficAdsPerformanceTable } from '@/components/TrafficAdsPerformanceTable';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { buildCroRows } from '@/lib/croRules';
import { MlPerformanceRow, TrafficPerformanceAdsRow } from '@/types';

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface MlVendasPanelProps {
  rows: MlPerformanceRow[];
  trafficAdsRows: TrafficPerformanceAdsRow[];
}

export function MlVendasPanel({ rows, trafficAdsRows }: MlVendasPanelProps) {
  const croRows = useMemo(() => buildCroRows(rows, trafficAdsRows), [rows, trafficAdsRows]);

  const { totalRevenue, organicRevenue, adsRevenue, adsSpend, roasAds } = useMemo(() => {
    const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
    const organicRevenue = rows
      .filter((r) => r.traffic_source === 'organic')
      .reduce((s, r) => s + r.revenue, 0);
    const adsRows = rows.filter((r) => r.traffic_source === 'ads');
    const adsRevenue = adsRows.reduce((s, r) => s + r.revenue, 0);
    const adsSpend = adsRows.reduce((s, r) => s + r.ad_spend, 0);
    const roasAds = adsSpend > 0 ? adsRevenue / adsSpend : 0;
    return { totalRevenue, organicRevenue, adsRevenue, adsSpend, roasAds };
  }, [rows]);

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* Cabeçalho e Filtros */}
      <div className="px-8 pt-7 pb-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Centro de Comando: CRO e Tráfego - Mercado Livre</h1>
          <p className="text-xs text-gray-400 mt-0.5">Alertas prescritivos por anúncio: escalar, otimizar ou pausar</p>
        </div>
        <MlDateRangeFilter />
      </div>

      <div className="flex-1 overflow-auto px-8 py-6 space-y-6">

        {/* Feed de Insights Acionáveis — o que fazer AGORA com cada anúncio */}
        <ActionableInsightsFeed rows={croRows} />

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <KpiCard title="Faturamento Total" value={fmtBRL(totalRevenue)} />
          <KpiCard title="Faturamento Orgânico" value={fmtBRL(organicRevenue)} />
          <KpiCard title="Faturamento Ads" value={fmtBRL(adsRevenue)} />
          <KpiCard title="Investimento Mercado Ads" value={fmtBRL(adsSpend)} />
          <KpiCard title="ROAS Geral Ads" value={`${roasAds.toFixed(2)}x`} />
        </div>

        {/* Gráfico */}
        <MlPerformanceChart rows={rows} />

        {/* Duas visões do mesmo motor de CRO: Kanban de decisão e matriz ordenável */}
        <Tabs defaultValue="pipeline">
          <TabsList>
            <TabsTrigger value="pipeline">Pipeline de CRO</TabsTrigger>
            <TabsTrigger value="matrix">Smart Matrix</TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline" className="mt-4">
            <CroPipelineBoard rows={croRows} />
          </TabsContent>

          <TabsContent value="matrix" className="mt-4 space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Smart Matrix (CRO e Tráfego)</h2>
              <SmartMatrixTable rows={croRows} />
            </div>

            {/* Ingestão via webhook n8n (traffic_performance_ads) */}
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-2">
                Orgânico vs Ads (agregado diário via webhook n8n)
              </h2>
              <TrafficAdsPerformanceTable rows={trafficAdsRows} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
