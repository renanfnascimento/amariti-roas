import { RoasStatusBadge } from '@/components/RoasStatusBadge';
import { TrafficPerformanceAdsRow } from '@/types';

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

interface TrafficAdsPerformanceTableProps {
  rows: TrafficPerformanceAdsRow[];
}

export function TrafficAdsPerformanceTable({ rows }: TrafficAdsPerformanceTableProps) {
  if (rows.length === 0) {
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
            <th className="px-4 py-3 text-left font-medium text-gray-600">Data</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Fonte</th>
            <th className="px-4 py-3 text-right font-medium text-gray-600">Investido</th>
            <th className="px-4 py-3 text-right font-medium text-gray-600">Faturamento</th>
            <th className="px-4 py-3 text-right font-medium text-gray-600">Pedidos</th>
            <th className="px-4 py-3 text-center font-medium text-gray-600">ROAS</th>
            <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => {
            const isOrganic = row.traffic_source === 'organic';
            const roas = row.ad_spend > 0 ? row.revenue / row.ad_spend : 0;
            return (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-700">{fmtDate(row.date)}</td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {isOrganic ? 'Orgânico' : 'Ads'}
                </td>
                <td className="px-4 py-3 text-right text-gray-700">{fmt(row.ad_spend)}</td>
                <td className="px-4 py-3 text-right text-gray-700">{fmt(row.revenue)}</td>
                <td className="px-4 py-3 text-right text-gray-700">{row.orders_count}</td>
                <td className="px-4 py-3 text-center font-semibold text-gray-900">
                  {isOrganic ? '—' : `${roas.toFixed(2)}x`}
                </td>
                <td className="px-4 py-3 text-center">
                  {isOrganic ? (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                      Orgânico
                    </span>
                  ) : (
                    <RoasStatusBadge roas={roas} />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
