'use client';

import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MlPerformanceRow } from '@/types';

function fmtBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDateLabel(date: string) {
  return date.slice(5).replace('-', '/');
}

interface MlPerformanceChartProps {
  rows: MlPerformanceRow[];
}

interface ChartPoint {
  date: string;
  revenue_organic: number;
  revenue_ads: number;
  ad_spend: number;
}

export function MlPerformanceChart({ rows }: MlPerformanceChartProps) {
  const byDate = new Map<string, ChartPoint>();

  for (const row of rows) {
    const point = byDate.get(row.date) ?? {
      date: row.date,
      revenue_organic: 0,
      revenue_ads: 0,
      ad_spend: 0,
    };

    if (row.traffic_source === 'organic') {
      point.revenue_organic += row.revenue;
    } else {
      point.revenue_ads += row.revenue;
      point.ad_spend += row.ad_spend;
    }

    byDate.set(row.date, point);
  }

  const data = [...byDate.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((p) => ({ ...p, date: fmtDateLabel(p.date) }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">
        Faturamento Orgânico x Ads x Investimento
      </h2>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `R$${v}`}
            width={60}
          />
          <Tooltip
            formatter={(value) => [fmtBRL(Number(value ?? 0)), '']}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
          <Bar dataKey="revenue_organic" name="Faturamento Orgânico" stackId="revenue" fill="#94a3b8" radius={[0, 0, 0, 0]} />
          <Bar dataKey="revenue_ads" name="Faturamento Ads" stackId="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="ad_spend" name="Investimento" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
