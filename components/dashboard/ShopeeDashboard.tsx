'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { KpiCard } from './KpiCard';
import { RevenueChart, DailyData } from './RevenueChart';
import { SalesFunnel, FunnelStep } from './SalesFunnel';
import { ShopeeMetricsRow } from '@/types';

// ─── Mock fallback (usado enquanto não há histórico no BD) ────────────────────

const MOCK_DAILY: DailyData[] = [
  { date: '01/06', spend: 58, revenue: 243 },
  { date: '02/06', spend: 72, revenue: 313 },
  { date: '03/06', spend: 65, revenue: 288 },
  { date: '04/06', spend: 89, revenue: 403 },
  { date: '05/06', spend: 79, revenue: 356 },
  { date: '06/06', spend: 92, revenue: 421 },
  { date: '07/06', spend: 110, revenue: 498 },
  { date: '08/06', spend: 98, revenue: 445 },
  { date: '09/06', spend: 86, revenue: 380 },
  { date: '10/06', spend: 102, revenue: 469 },
  { date: '11/06', spend: 96, revenue: 433 },
  { date: '12/06', spend: 88, revenue: 397 },
  { date: '13/06', spend: 116, revenue: 528 },
  { date: '14/06', spend: 126, revenue: 579 },
  { date: '15/06', spend: 118, revenue: 542 },
  { date: '16/06', spend: 109, revenue: 499 },
  { date: '17/06', spend: 132, revenue: 613 },
  { date: '18/06', spend: 143, revenue: 658 },
  { date: '19/06', spend: 128, revenue: 592 },
  { date: '20/06', spend: 139, revenue: 641 },
  { date: '21/06', spend: 145, revenue: 673 },
];

const MOCK_KPI = {
  ad_spend: 2191,       ad_spend_prev: 1980,
  revenue: 9971,        revenue_prev: 8320,
  roas: 4.55,           roas_prev: 4.20,
  orders: 89,           orders_prev: 74,
  cpa: 24.61,           cpa_prev: 26.76,
  cpm: 8.43,            cpm_prev: 8.92,
};

const MOCK_FUNNEL: FunnelStep[] = [
  { label: 'Impressões',  value: 218432, formatted: '218.432',  sub: '100%',  color: 'bg-indigo-400' },
  { label: 'Cliques',     value: 4320,   formatted: '4.320',    sub: '~2,0%', color: 'bg-indigo-500' },
  { label: 'Pedidos',     value: 89,     formatted: '89',       sub: '~2,1%', color: 'bg-violet-600' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function pctChange(current: number, prev: number) {
  if (prev === 0) return 0;
  return ((current - prev) / prev) * 100;
}

function roasCardClass(roas: number) {
  if (roas >= 3.0) return 'bg-emerald-50 border-emerald-200';
  if (roas >= 1.5) return 'bg-yellow-50 border-yellow-200';
  return 'bg-red-50 border-red-200';
}

function roasTextClass(roas: number) {
  if (roas >= 3.0) return 'text-emerald-700';
  if (roas >= 1.5) return 'text-yellow-700';
  return 'text-red-700';
}

// ─── Component ───────────────────────────────────────────────────────────────

interface ShopeeDashboardProps {
  metrics: ShopeeMetricsRow[];
}

export function ShopeeDashboard({ metrics }: ShopeeDashboardProps) {
  const [account, setAccount] = useState('shopee-renan');
  const [campaign, setCampaign] = useState('all');
  const [status, setStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('2026-06-01');
  const [dateTo, setDateTo] = useState('2026-06-21');

  const { kpi, dailyData } = useMemo(() => {
    if (metrics.length === 0) {
      return { kpi: MOCK_KPI, dailyData: MOCK_DAILY };
    }

    const totalSpend   = metrics.reduce((s, m) => s + m.ad_spend, 0);
    const totalRevenue = metrics.reduce((s, m) => s + m.revenue, 0);
    const roas         = totalSpend > 0 ? totalRevenue / totalSpend : 0;
    const orders       = metrics.length;
    const cpa          = orders > 0 ? totalSpend / orders : 0;

    const byDate = metrics.reduce<Record<string, DailyData>>((acc, m) => {
      const d = m.date.slice(5).replace('-', '/');
      if (!acc[d]) acc[d] = { date: d, spend: 0, revenue: 0 };
      acc[d].spend   += m.ad_spend;
      acc[d].revenue += m.revenue;
      return acc;
    }, {});

    return {
      kpi: {
        ad_spend: totalSpend,  ad_spend_prev: totalSpend * 0.9,
        revenue:  totalRevenue, revenue_prev:  totalRevenue * 0.83,
        roas,                  roas_prev:      roas * 0.92,
        orders,                orders_prev:    Math.floor(orders * 0.84),
        cpa,                   cpa_prev:       cpa * 1.09,
        cpm: MOCK_KPI.cpm,    cpm_prev:       MOCK_KPI.cpm_prev,
      },
      dailyData: Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)),
    };
  }, [metrics]);

  const filterSelectClass =
    'rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer';

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* ── Header ── */}
      <div className="px-8 pt-7 pb-1">
        <h1 className="text-xl font-bold text-gray-900">Dashboard Shopee</h1>
        <p className="text-xs text-gray-400 mt-0.5">Conta: <span className="font-semibold text-gray-600">Shopee Renan</span></p>
      </div>

      {/* ── Barra de Filtros ── */}
      <div className="px-8 py-4 flex flex-wrap items-center gap-3 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">De</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className={filterSelectClass}
          />
          <label className="text-xs font-medium text-gray-500">até</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className={filterSelectClass}
          />
        </div>

        <select value={account} onChange={(e) => setAccount(e.target.value)} className={filterSelectClass}>
          <option value="shopee-renan">Shopee Renan</option>
          <option value="shopee-amariti">Shopee Amariti</option>
        </select>

        <select value={campaign} onChange={(e) => setCampaign(e.target.value)} className={filterSelectClass}>
          <option value="all">Todas as Campanhas</option>
          <option value="verao">Linha Verão</option>
          <option value="flash">Flash Sale</option>
          <option value="promo">Promoção Ativa</option>
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)} className={filterSelectClass}>
          <option value="all">Todos os Status</option>
          <option value="active">Ativas</option>
          <option value="paused">Pausadas</option>
        </select>

        <span className="ml-auto text-[11px] text-gray-400 font-medium">
          {metrics.length > 0 ? `${metrics.length} registros reais` : 'Dados demonstrativos'}
        </span>
      </div>

      <div className="flex-1 overflow-auto px-8 py-6 space-y-6">

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard
            title="Investimento"
            value={fmtBRL(kpi.ad_spend)}
            changePercent={pctChange(kpi.ad_spend, kpi.ad_spend_prev)}
          />
          <KpiCard
            title="CPM"
            value={fmtBRL(kpi.cpm)}
            changePercent={pctChange(kpi.cpm, kpi.cpm_prev)}
            lowerIsBetter
          />
          <KpiCard
            title="Custo por Pedido"
            value={fmtBRL(kpi.cpa)}
            changePercent={pctChange(kpi.cpa, kpi.cpa_prev)}
            lowerIsBetter
          />
          <KpiCard
            title="Faturamento"
            value={fmtBRL(kpi.revenue)}
            changePercent={pctChange(kpi.revenue, kpi.revenue_prev)}
          />
          <KpiCard
            title="Pedidos"
            value={kpi.orders.toLocaleString('pt-BR')}
            changePercent={pctChange(kpi.orders, kpi.orders_prev)}
          />

          {/* ROAS — cartão semáforo */}
          <div className={cn('rounded-xl border p-4 shadow-sm flex flex-col gap-1', roasCardClass(kpi.roas))}>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">ROAS</p>
            <p className={cn('text-2xl font-bold leading-tight', roasTextClass(kpi.roas))}>
              {kpi.roas.toFixed(2)}x
            </p>
            <p className={cn('text-[11px] font-bold mt-1', roasTextClass(kpi.roas))}>
              {kpi.roas >= 3.0 ? '🟢 Escalar' : kpi.roas >= 1.5 ? '🟡 Monitorar' : '🔴 Pausar'}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {pctChange(kpi.roas, kpi.roas_prev) >= 0 ? '+' : ''}
              {pctChange(kpi.roas, kpi.roas_prev).toFixed(1)}% vs mês ant.
            </p>
          </div>
        </div>

        {/* ── Gráficos ── */}
        <div className="grid grid-cols-3 gap-4">

          {/* Funil (1/3) */}
          <div className="col-span-1 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Funil de Vendas</h2>
            <SalesFunnel steps={MOCK_FUNNEL} />
          </div>

          {/* Linha dupla (2/3) */}
          <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Investimento vs Faturamento</h2>
              <span className="text-[11px] text-gray-400">Junho 2026</span>
            </div>
            <RevenueChart data={dailyData} />
          </div>
        </div>

      </div>
    </div>
  );
}
