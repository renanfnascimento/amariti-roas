'use client';

import { useMemo } from 'react';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { MlDateRangeFilter } from '@/components/MlDateRangeFilter';
import { MlPerformanceChart } from '@/components/dashboard/MlPerformanceChart';
import { MlPerformanceTable } from '@/components/MlPerformanceTable';
import { MlPerformanceRow } from '@/types';

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface MlVendasPanelProps {
  rows: MlPerformanceRow[];
}

export function MlVendasPanel({ rows }: MlVendasPanelProps) {
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
          <h1 className="text-xl font-bold text-gray-900">Performance e ROAS - Mercado Livre</h1>
          <p className="text-xs text-gray-400 mt-0.5">Painel de decisão rápida por campanha</p>
        </div>
        <MlDateRangeFilter />
      </div>

      <div className="flex-1 overflow-auto px-8 py-6 space-y-6">

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

        {/* Tabela de Decisão */}
        <MlPerformanceTable rows={rows} />
      </div>
    </div>
  );
}
