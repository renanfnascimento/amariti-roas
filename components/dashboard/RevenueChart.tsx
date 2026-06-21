'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface DailyData {
  date: string;
  spend: number;
  revenue: number;
}

function fmtBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function RevenueChart({ data }: { data: DailyData[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
          iconType="line"
        />
        <Line
          type="monotone"
          dataKey="spend"
          name="Investimento"
          stroke="#6366f1"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          name="Faturamento"
          stroke="#22c55e"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
