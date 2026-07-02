import { RoasStatusBadge } from '@/components/RoasStatusBadge';
import { TrafficPerformanceAdsRow } from '@/types';

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

interface DayRow {
  date: string;
  organic?: TrafficPerformanceAdsRow;
  ads?: TrafficPerformanceAdsRow;
}

function groupByDate(rows: TrafficPerformanceAdsRow[]): DayRow[] {
  const byDate = new Map<string, DayRow>();

  for (const row of rows) {
    const day = byDate.get(row.date) ?? { date: row.date };
    if (row.traffic_source === 'ml_organico') day.organic = row;
    else day.ads = row;
    byDate.set(row.date, day);
  }

  return Array.from(byDate.values()).sort((a, b) => b.date.localeCompare(a.date));
}

function OrganicProfitBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
      100% Lucro
    </span>
  );
}

interface TrafficAdsPerformanceTableProps {
  rows: TrafficPerformanceAdsRow[];
}

export function TrafficAdsPerformanceTable({ rows }: TrafficAdsPerformanceTableProps) {
  const days = groupByDate(rows);

  if (days.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
        <p className="text-sm text-gray-500">
          Nenhum registro de traffic_performance_ads encontrado para o período selecionado.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th rowSpan={2} className="px-4 py-3 text-left font-medium text-gray-600 align-bottom">
              Data
            </th>
            <th colSpan={3} className="px-4 py-2 text-center font-semibold text-gray-500 border-l border-gray-200">
              Orgânico
            </th>
            <th colSpan={5} className="px-4 py-2 text-center font-semibold text-gray-500 border-l border-gray-200">
              Ads
            </th>
          </tr>
          <tr className="text-xs">
            <th className="px-4 py-2 text-right font-medium text-gray-600 border-l border-gray-200">Faturamento</th>
            <th className="px-4 py-2 text-right font-medium text-gray-600">Pedidos</th>
            <th className="px-4 py-2 text-center font-medium text-gray-600">Status</th>
            <th className="px-4 py-2 text-right font-medium text-gray-600 border-l border-gray-200">Investido</th>
            <th className="px-4 py-2 text-right font-medium text-gray-600">Faturamento</th>
            <th className="px-4 py-2 text-right font-medium text-gray-600">Pedidos</th>
            <th className="px-4 py-2 text-center font-medium text-gray-600">ROAS</th>
            <th className="px-4 py-2 text-center font-medium text-gray-600">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {days.map((day) => {
            const organic = day.organic;
            const ads = day.ads;
            const roas = ads && ads.ad_spend > 0 ? ads.revenue / ads.ad_spend : 0;
            return (
              <tr key={day.date} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-700">{fmtDate(day.date)}</td>

                <td className="px-4 py-3 text-right text-gray-700 border-l border-gray-100">
                  {fmt(organic?.revenue ?? 0)}
                </td>
                <td className="px-4 py-3 text-right text-gray-700">{organic?.orders_count ?? 0}</td>
                <td className="px-4 py-3 text-center">
                  {organic ? <OrganicProfitBadge /> : <span className="text-gray-400">—</span>}
                </td>

                <td className="px-4 py-3 text-right text-gray-700 border-l border-gray-100">
                  {fmt(ads?.ad_spend ?? 0)}
                </td>
                <td className="px-4 py-3 text-right text-gray-700">{fmt(ads?.revenue ?? 0)}</td>
                <td className="px-4 py-3 text-right text-gray-700">{ads?.orders_count ?? 0}</td>
                <td className="px-4 py-3 text-center font-semibold text-gray-900">
                  {ads && ads.ad_spend > 0 ? `${roas.toFixed(2)}x` : '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  {ads ? <RoasStatusBadge roas={roas} /> : <span className="text-gray-400">—</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
