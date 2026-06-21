'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { RoasBadge } from '@/components/RoasBadge';
import { QuickEditCampaignDialog } from '@/components/QuickEditCampaignDialog';
import { ShopeeMetricsRow } from '@/types';

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface CampaignTableProps {
  rows: ShopeeMetricsRow[];
}

export function CampaignTable({ rows }: CampaignTableProps) {
  const [selected, setSelected] = useState<ShopeeMetricsRow | null>(null);
  const [open, setOpen] = useState(false);

  function handleEdit(row: ShopeeMetricsRow) {
    setSelected(row);
    setOpen(true);
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
        <p className="text-sm text-gray-500">
          Nenhuma campanha encontrada. Sincronize os dados da Shopee para começar.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Campanha</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Orç. Diário</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Investido</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Faturamento</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">ROAS</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{row.campaigns.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      row.campaigns.status
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {row.campaigns.status ? 'Ativa' : 'Pausada'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-700">
                  {fmt(row.campaigns.daily_budget)}
                </td>
                <td className="px-4 py-3 text-right text-gray-700">{fmt(row.ad_spend)}</td>
                <td className="px-4 py-3 text-right text-gray-700">{fmt(row.revenue)}</td>
                <td className="px-4 py-3 text-center">
                  {row.roas > 0 ? (
                    <RoasBadge roas={row.roas} />
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleEdit(row)}
                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                  >
                    <Pencil className="h-3 w-3" />
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <QuickEditCampaignDialog
        key={selected?.campaign_id ?? 'none'}
        open={open}
        onOpenChange={setOpen}
        campaignId={selected?.campaign_id ?? null}
        campaignName={selected?.campaigns.name ?? null}
        currentBudget={selected?.campaigns.daily_budget ?? 0}
      />
    </>
  );
}
