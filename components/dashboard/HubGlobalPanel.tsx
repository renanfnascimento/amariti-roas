'use client';

import { useMemo, useState } from 'react';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { MlDateRangeFilter } from '@/components/MlDateRangeFilter';
import { AccountName, MlPerformanceRow, ShopeePerformanceRoasRow } from '@/types';
import { cn } from '@/lib/utils';

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

// ── Agregação diária cross-canal ────────────────────────────────────────────────
// Soma faturamento e gasto por dia independentemente do canal (ML + Shopee) e da
// conta (Momento + Amariti). ml_performance_roas já contém orgânico + ads, então
// é a única fonte do lado ML (traffic_performance_ads duplicaria os totais).

interface HubDailyRow {
  date:           string;
  ml_revenue:     number;
  ml_spend:       number;
  shopee_revenue: number;
  shopee_spend:   number;
}

interface HubGlobalPanelProps {
  mlRows:     MlPerformanceRow[];
  shopeeRows: ShopeePerformanceRoasRow[];
}

// ── Dimensão multi-conta ────────────────────────────────────────────────────────

const ACCOUNT_LABELS: Record<AccountName, string> = {
  momento: 'Momento',
  amariti: 'Amariti',
  global:  'Global',
};

type AccountFilter = 'todas' | AccountName;

interface AccountSummary {
  account: AccountName;
  revenue: number;
  spend:   number;
  roas:    number;
}

export function HubGlobalPanel({ mlRows, shopeeRows }: HubGlobalPanelProps) {
  const [accountFilter, setAccountFilter] = useState<AccountFilter>('todas');

  // Contas com dados no período + as duas operações fixas, para o filtro nunca
  // esconder um botão só porque a conta ainda não tem linhas.
  const accounts = useMemo<AccountName[]>(() => {
    const found = new Set<AccountName>(['momento', 'amariti']);
    for (const r of mlRows) found.add(r.account_name);
    for (const r of shopeeRows) found.add(r.account_name);
    return [...found];
  }, [mlRows, shopeeRows]);

  const filteredMl = useMemo(
    () => (accountFilter === 'todas' ? mlRows : mlRows.filter((r) => r.account_name === accountFilter)),
    [mlRows, accountFilter],
  );
  const filteredShopee = useMemo(
    () => (accountFilter === 'todas' ? shopeeRows : shopeeRows.filter((r) => r.account_name === accountFilter)),
    [shopeeRows, accountFilter],
  );

  // Quebra por conta cruzando os dois canais — sempre sobre o dataset completo,
  // para a comparação Momento vs Amariti não sumir quando um filtro está ativo.
  const accountSummaries = useMemo<AccountSummary[]>(() => {
    return accounts.map((account) => {
      const revenue =
        mlRows.filter((r) => r.account_name === account).reduce((s, r) => s + r.revenue, 0) +
        shopeeRows.filter((r) => r.account_name === account).reduce((s, r) => s + r.revenue, 0);
      const spend =
        mlRows.filter((r) => r.account_name === account).reduce((s, r) => s + r.ad_spend, 0) +
        shopeeRows.filter((r) => r.account_name === account).reduce((s, r) => s + r.ad_spend, 0);
      return { account, revenue, spend, roas: spend > 0 ? revenue / spend : 0 };
    });
  }, [accounts, mlRows, shopeeRows]);

  const daily = useMemo<HubDailyRow[]>(() => {
    const byDate = new Map<string, HubDailyRow>();

    function entry(date: string): HubDailyRow {
      let row = byDate.get(date);
      if (!row) {
        row = { date, ml_revenue: 0, ml_spend: 0, shopee_revenue: 0, shopee_spend: 0 };
        byDate.set(date, row);
      }
      return row;
    }

    for (const r of filteredMl) {
      const row = entry(r.date);
      row.ml_revenue += r.revenue;
      row.ml_spend   += r.ad_spend;
    }
    for (const r of filteredShopee) {
      const row = entry(r.date);
      row.shopee_revenue += r.revenue;
      row.shopee_spend   += r.ad_spend;
    }

    return [...byDate.values()].sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredMl, filteredShopee]);

  const totals = useMemo(() => {
    const mlRevenue     = daily.reduce((s, r) => s + r.ml_revenue, 0);
    const mlSpend       = daily.reduce((s, r) => s + r.ml_spend, 0);
    const shopeeRevenue = daily.reduce((s, r) => s + r.shopee_revenue, 0);
    const shopeeSpend   = daily.reduce((s, r) => s + r.shopee_spend, 0);
    const revenue       = mlRevenue + shopeeRevenue;
    const spend         = mlSpend + shopeeSpend;
    const roas          = spend > 0 ? revenue / spend : 0;
    return { mlRevenue, mlSpend, shopeeRevenue, shopeeSpend, revenue, spend, roas };
  }, [daily]);

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* Cabeçalho e Filtros */}
      <div className="px-8 pt-7 pb-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Hub Global de Performance</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Visão consolidada: todos os canais (ML + Shopee) e todas as contas (Momento + Amariti)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">

          {/* Filtro de conta (multi-conta: Momento vs Amariti) */}
          <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5">
            {(['todas', ...accounts] as AccountFilter[]).map((option) => (
              <button
                key={option}
                onClick={() => setAccountFilter(option)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                  accountFilter === option
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                    : 'text-gray-500 hover:text-gray-800',
                )}
              >
                {option === 'todas' ? 'Todas as contas' : ACCOUNT_LABELS[option]}
              </button>
            ))}
          </div>

          <MlDateRangeFilter />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-8 py-6 space-y-6">

        {/* Resumo executivo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <KpiCard title="Faturamento Total" value={fmtBRL(totals.revenue)} />
          <KpiCard title="Custo em Ads Total" value={fmtBRL(totals.spend)} />
          <KpiCard title="ROAS Global" value={`${totals.roas.toFixed(2)}x`} />
        </div>

        {/* Quebra por canal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard title="Faturamento ML" value={fmtBRL(totals.mlRevenue)} />
          <KpiCard title="Custo Ads ML" value={fmtBRL(totals.mlSpend)} />
          <KpiCard title="Faturamento Shopee" value={fmtBRL(totals.shopeeRevenue)} />
          <KpiCard title="Custo Ads Shopee" value={fmtBRL(totals.shopeeSpend)} />
        </div>

        {/* Quebra por conta (Momento vs Amariti, cruzando ML + Shopee) */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Performance por Conta (todos os canais)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {accountSummaries.map(({ account, revenue, spend, roas }) => (
              <div
                key={account}
                className={cn(
                  'rounded-xl border bg-white p-4 shadow-sm',
                  accountFilter === account ? 'border-orange-300 ring-1 ring-orange-200' : 'border-gray-200',
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-900">{ACCOUNT_LABELS[account]}</p>
                  {revenue === 0 && spend === 0 && (
                    <span className="text-[10px] bg-gray-100 text-gray-400 rounded px-1.5 py-0.5">
                      Sem dados no período
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Faturamento</p>
                    <p className="text-sm font-bold text-gray-900">{fmtBRL(revenue)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Custo Ads</p>
                    <p className="text-sm font-bold text-gray-900">{fmtBRL(spend)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">ROAS</p>
                    <p className="text-sm font-bold text-gray-900">{spend > 0 ? `${roas.toFixed(2)}x` : '—'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Consolidado diário */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            Consolidado Diário ({accountFilter === 'todas' ? 'todas as contas' : `conta ${ACCOUNT_LABELS[accountFilter]}`})
          </h2>
          {daily.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
              <p className="text-sm text-gray-500">
                Nenhum registro encontrado para o período selecionado.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white overflow-x-auto shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Data</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Fat. ML</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Fat. Shopee</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Faturamento Total</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Custo Ads Total</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">ROAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {daily.map((row) => {
                    const revenue = row.ml_revenue + row.shopee_revenue;
                    const spend   = row.ml_spend + row.shopee_spend;
                    const roas    = spend > 0 ? revenue / spend : 0;
                    return (
                      <tr key={row.date} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{fmtDate(row.date)}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{fmtBRL(row.ml_revenue)}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{fmtBRL(row.shopee_revenue)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmtBRL(revenue)}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{fmtBRL(spend)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          {spend > 0 ? `${roas.toFixed(2)}x` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
