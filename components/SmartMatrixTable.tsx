'use client';

import { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
  Rocket,
  AlertTriangle,
  Ban,
  Gem,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuickEditMlDialog } from '@/components/QuickEditMlDialog';
import {
  CroRow,
  CroAlertKind,
  classifyCroRow,
  computeCroMetrics,
} from '@/lib/croRules';

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

// ── Badge de ação sugerida (semáforo da Missão 1) ──────────────────────────────

const ACTION_BADGES: Record<
  CroAlertKind,
  { icon: LucideIcon; classes: string }
> = {
  pausa:        { icon: Ban,           classes: 'bg-red-100 text-red-800' },
  gargalo:      { icon: AlertTriangle, classes: 'bg-orange-100 text-orange-800' },
  escala:       { icon: Rocket,        classes: 'bg-green-100 text-green-800' },
  mina_de_ouro: { icon: Gem,           classes: 'bg-blue-100 text-blue-800' },
};

function ActionBadge({ row }: { row: CroRow }) {
  const alert = classifyCroRow(row);

  if (!alert) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
        {row.source === 'organic' ? 'Orgânico Estável' : 'Monitorar'}
      </span>
    );
  }

  const { icon: Icon, classes } = ACTION_BADGES[alert.kind];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        classes
      )}
      title={alert.recommendation}
    >
      <Icon className="h-3 w-3" />
      {alert.label}
    </span>
  );
}

// ── Ordenação ──────────────────────────────────────────────────────────────────

type SortKey = 'name' | 'source' | 'date' | 'ad_spend' | 'revenue' | 'ctr' | 'roas';

interface SortState {
  key: SortKey;
  dir: 'asc' | 'desc';
}

interface ComputedRow extends CroRow {
  ctr:  number;
  roas: number;
}

const HEADERS: { key: SortKey; label: string; alignClass: string }[] = [
  { key: 'date',     label: 'Data',              alignClass: 'text-left' },
  { key: 'name',     label: 'Produto/Campanha',  alignClass: 'text-left' },
  { key: 'source',   label: 'Fonte',             alignClass: 'text-left' },
  { key: 'ad_spend', label: 'Custo',             alignClass: 'text-right' },
  { key: 'revenue',  label: 'Faturamento',       alignClass: 'text-right' },
  { key: 'ctr',      label: 'CTR (%)',           alignClass: 'text-right' },
  { key: 'roas',     label: 'ROAS',              alignClass: 'text-right' },
];

interface SmartMatrixTableProps {
  rows: CroRow[];
}

export function SmartMatrixTable({ rows }: SmartMatrixTableProps) {
  const [sort, setSort] = useState<SortState>({ key: 'roas', dir: 'asc' });
  const [selected, setSelected] = useState<CroRow | null>(null);
  const [open, setOpen] = useState(false);

  const computed = useMemo<ComputedRow[]>(
    () =>
      rows.map((row) => {
        const { ctr, roas } = computeCroMetrics(row);
        return { ...row, ctr, roas };
      }),
    [rows]
  );

  const sorted = useMemo(() => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...computed].sort((a, b) => {
      const va = a[sort.key];
      const vb = b[sort.key];
      if (typeof va === 'string' && typeof vb === 'string') {
        return va.localeCompare(vb, 'pt-BR') * dir;
      }
      return ((va as number) - (vb as number)) * dir;
    });
  }, [computed, sort]);

  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
  }

  function handleEdit(row: CroRow) {
    setSelected(row);
    setOpen(true);
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
        <p className="text-sm text-gray-500">
          Nenhum registro encontrado para o período selecionado.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {HEADERS.map(({ key, label, alignClass }) => {
                const active = sort.key === key;
                const SortIcon = !active ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown;
                return (
                  <th key={key} className={cn('px-4 py-3 font-medium text-gray-600', alignClass)}>
                    <button
                      onClick={() => toggleSort(key)}
                      className={cn(
                        'inline-flex items-center gap-1 hover:text-gray-900 transition-colors',
                        active && 'text-gray-900 font-semibold'
                      )}
                    >
                      {label}
                      <SortIcon className="h-3 w-3" />
                    </button>
                  </th>
                );
              })}
              <th className="px-4 py-3 text-center font-medium text-gray-600">Ação Sugerida</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Editar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((row) => {
              const isOrganic = row.source === 'organic';
              return (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{fmtDate(row.date)}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                        isOrganic ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                      )}
                    >
                      {isOrganic ? 'Orgânico' : 'Ads'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">{fmtBRL(row.ad_spend)}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{fmtBRL(row.revenue)}</td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {row.impressions > 0 ? `${row.ctr.toFixed(2)}%` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    {isOrganic ? '—' : `${row.roas.toFixed(2)}x`}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ActionBadge row={row} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.editable ? (
                      <button
                        onClick={() => handleEdit(row)}
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                      >
                        <Pencil className="h-3 w-3" />
                        Editar
                      </button>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <QuickEditMlDialog
        key={selected?.id ?? 'none'}
        open={open}
        onOpenChange={setOpen}
        rowId={selected?.id ?? null}
        campaignName={selected?.name ?? null}
        currentAdSpend={selected?.ad_spend ?? 0}
        currentRevenue={selected?.revenue ?? 0}
      />
    </>
  );
}
