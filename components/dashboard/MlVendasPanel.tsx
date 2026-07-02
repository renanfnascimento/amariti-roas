'use client';

import { useMemo } from 'react';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { MlDateRangeFilter } from '@/components/MlDateRangeFilter';
import { MlPerformanceTable } from '@/components/MlPerformanceTable';
import { MlPerformanceRow } from '@/types';

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface MlVendasPanelProps {
  rows: MlPerformanceRow[];
}

export function MlVendasPanel({ rows }: MlVendasPanelProps) {
  const { totalAdSpend, totalRevenue, roasGlobal } = useMemo(() => {
    const totalAdSpend = rows.reduce((s, r) => s + r.ad_spend, 0);
    const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
    const roasGlobal = totalAdSpend > 0 ? totalRevenue / totalAdSpend : 0;
    return { totalAdSpend, totalRevenue, roasGlobal };
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <KpiCard title="Investimento Total" value={fmtBRL(totalAdSpend)} />
          <KpiCard title="Faturamento Total" value={fmtBRL(totalRevenue)} />
          <KpiCard title="ROAS Global" value={`${roasGlobal.toFixed(2)}x`} />
        </div>

        {/* Tabela de Decisão */}
        <MlPerformanceTable rows={rows} />
      </div>
    </div>
  );
}
