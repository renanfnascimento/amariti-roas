'use client';

import {
  BarChart,
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

interface MlPerformanceChartProps {
  rows: MlPerformanceRow[];
}

export function MlPerformanceChart({ rows }: MlPerformanceChartProps) {
  const data = [...rows]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => ({
      campaign_name: r.campaign_name,
      ad_spend: r.ad_spend,
      revenue: r.revenue,
    }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Investimento vs Faturamento</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="campaign_name"
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
          <Bar dataKey="ad_spend" name="Investimento" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="revenue" name="Faturamento" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
