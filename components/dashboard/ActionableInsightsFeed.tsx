'use client';

import { useMemo } from 'react';
import { Rocket, AlertTriangle, Ban, Gem, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CroRow,
  CroAlert,
  CroAlertKind,
  classifyCroRow,
  computeCroMetrics,
} from '@/lib/croRules';

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface AlertStyle {
  icon:      LucideIcon;
  container: string;
  iconColor: string;
  badge:     string;
}

// pausa e gargalo primeiro: dinheiro sendo perdido salta aos olhos antes das oportunidades.
const KIND_ORDER: CroAlertKind[] = ['pausa', 'gargalo', 'escala', 'mina_de_ouro'];

const ALERT_STYLES: Record<CroAlertKind, AlertStyle> = {
  pausa: {
    icon: Ban,
    container: 'border-red-300 bg-red-50',
    iconColor: 'text-red-600',
    badge: 'bg-red-100 text-red-800',
  },
  gargalo: {
    icon: AlertTriangle,
    container: 'border-orange-300 bg-orange-50',
    iconColor: 'text-orange-600',
    badge: 'bg-orange-100 text-orange-800',
  },
  escala: {
    icon: Rocket,
    container: 'border-green-300 bg-green-50',
    iconColor: 'text-green-600',
    badge: 'bg-green-100 text-green-800',
  },
  mina_de_ouro: {
    icon: Gem,
    container: 'border-blue-300 bg-blue-50',
    iconColor: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-800',
  },
};

interface Insight {
  row:   CroRow;
  alert: CroAlert;
}

interface ActionableInsightsFeedProps {
  rows: CroRow[];
}

export function ActionableInsightsFeed({ rows }: ActionableInsightsFeedProps) {
  const insights = useMemo<Insight[]>(() => {
    return rows
      .map((row) => ({ row, alert: classifyCroRow(row) }))
      .filter((i): i is Insight => i.alert !== null)
      .sort(
        (a, b) =>
          KIND_ORDER.indexOf(a.alert.kind) - KIND_ORDER.indexOf(b.alert.kind)
      );
  }, [rows]);

  if (insights.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-500">
          Nenhum alerta acionável no período — nenhuma campanha queimando verba nem
          oportunidade de escala detectada.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-700 mb-2">
        Insights Acionáveis ({insights.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {insights.map(({ row, alert }) => {
          const style = ALERT_STYLES[alert.kind];
          const Icon = style.icon;
          const { roas, ctr } = computeCroMetrics(row);
          return (
            <div
              key={`${alert.kind}-${row.id}`}
              className={cn(
                'rounded-lg border-2 p-4 shadow-sm flex gap-3 transition-transform hover:scale-[1.02]',
                style.container
              )}
            >
              <Icon className={cn('h-6 w-6 shrink-0 mt-0.5', style.iconColor)} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide',
                      style.badge
                    )}
                  >
                    {alert.label}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 truncate">
                    {row.name}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {row.source === 'ads'
                    ? `ROAS ${roas.toFixed(2)}x · CTR ${ctr.toFixed(2)}% · Custo ${fmtBRL(row.ad_spend)}`
                    : `${row.orders_count} pedidos · ${fmtBRL(row.revenue)} sem investir em Ads`}
                </p>
                <p className="text-xs font-medium text-gray-800 mt-1.5">
                  {alert.recommendation}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
