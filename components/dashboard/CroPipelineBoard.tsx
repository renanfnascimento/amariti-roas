'use client';

import { useMemo } from 'react';
import { Ban, Wrench, Eye, Rocket, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CroRow, classifyCroRow, computeCroMetrics } from '@/lib/croRules';

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

// ── Estágios do pipeline ────────────────────────────────────────────────────────
// Reaproveita o motor de regras do croRules: cada CroAlertKind cai num estágio.
// mina_de_ouro (orgânico com tração) entra em ESCALAR — a ação é a mesma:
// colocar verba. Sem alerta = MONITORAR.

type PipelineStage = 'pausar' | 'otimizar' | 'monitorar' | 'escalar';

interface StageConfig {
  key:         PipelineStage;
  title:       string;
  subtitle:    string;
  icon:        LucideIcon;
  headerClass: string;   // faixa superior da coluna
  countClass:  string;   // badge com contagem
  accentClass: string;   // borda esquerda dos cards
}

const STAGES: StageConfig[] = [
  {
    key: 'pausar',
    title: 'PAUSAR',
    subtitle: 'Queimando verba',
    icon: Ban,
    headerClass: 'bg-red-50 border-red-200 text-red-700',
    countClass:  'bg-red-100 text-red-700',
    accentClass: 'border-l-red-500',
  },
  {
    key: 'otimizar',
    title: 'OTIMIZAR',
    subtitle: 'Gargalo de conversão',
    icon: Wrench,
    headerClass: 'bg-orange-50 border-orange-200 text-orange-700',
    countClass:  'bg-orange-100 text-orange-700',
    accentClass: 'border-l-orange-500',
  },
  {
    key: 'monitorar',
    title: 'MONITORAR',
    subtitle: 'Sem alerta ativo',
    icon: Eye,
    headerClass: 'bg-gray-50 border-gray-200 text-gray-600',
    countClass:  'bg-gray-200 text-gray-600',
    accentClass: 'border-l-gray-300',
  },
  {
    key: 'escalar',
    title: 'ESCALAR',
    subtitle: 'Máquina de lucro',
    icon: Rocket,
    headerClass: 'bg-green-50 border-green-200 text-green-700',
    countClass:  'bg-green-100 text-green-700',
    accentClass: 'border-l-green-500',
  },
];

function resolveStage(row: CroRow): PipelineStage {
  const alert = classifyCroRow(row);
  if (!alert) return 'monitorar';
  switch (alert.kind) {
    case 'pausa':        return 'pausar';
    case 'gargalo':      return 'otimizar';
    case 'escala':       return 'escalar';
    case 'mina_de_ouro': return 'escalar';
  }
}

// ── Card de campanha ────────────────────────────────────────────────────────────

interface PipelineCardProps {
  row:    CroRow;
  accent: string;
}

function PipelineCard({ row, accent }: PipelineCardProps) {
  const { roas, ctr } = computeCroMetrics(row);
  const alert = classifyCroRow(row);
  const isOrganic = row.source === 'organic';

  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 border-l-4 bg-white p-3 shadow-sm hover:shadow-md transition-shadow',
        accent
      )}
      title={alert?.recommendation}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
          {row.name}
        </p>
        <span
          className={cn(
            'flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
            isOrganic ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
          )}
        >
          {isOrganic ? 'Orgânico' : 'Ads'}
        </span>
      </div>

      <p className="text-[10px] text-gray-400 mt-0.5">{fmtDate(row.date)}</p>

      {/* ROAS em destaque */}
      <p className="text-xl font-bold text-gray-900 mt-2 leading-none">
        {isOrganic ? '—' : `${roas.toFixed(2)}x`}
        <span className="ml-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          ROAS
        </span>
      </p>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3 text-xs">
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Investimento</p>
          <p className="font-semibold text-gray-800">{fmtBRL(row.ad_spend)}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Faturamento</p>
          <p className="font-semibold text-gray-800">{fmtBRL(row.revenue)}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">CTR</p>
          <p className="font-semibold text-gray-800">
            {row.impressions > 0 ? `${ctr.toFixed(2)}%` : '—'}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Pedidos</p>
          <p className="font-semibold text-gray-800">{row.orders_count}</p>
        </div>
      </div>
    </div>
  );
}

// ── Board ───────────────────────────────────────────────────────────────────────

interface CroPipelineBoardProps {
  rows: CroRow[];
}

export function CroPipelineBoard({ rows }: CroPipelineBoardProps) {
  const byStage = useMemo(() => {
    const map: Record<PipelineStage, CroRow[]> = {
      pausar: [], otimizar: [], monitorar: [], escalar: [],
    };
    for (const row of rows) map[resolveStage(row)].push(row);
    // Dentro de cada coluna, maior investimento primeiro — é onde a decisão
    // tem mais impacto financeiro.
    for (const stage of Object.values(map)) {
      stage.sort((a, b) => b.ad_spend - a.ad_spend || b.revenue - a.revenue);
    }
    return map;
  }, [rows]);

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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {STAGES.map((stage) => {
        const stageRows = byStage[stage.key];
        return (
          <div key={stage.key} className="flex flex-col rounded-xl bg-gray-100/70 border border-gray-200">

            {/* Cabeçalho da coluna */}
            <div
              className={cn(
                'flex items-center gap-2 rounded-t-xl border-b px-3 py-2.5',
                stage.headerClass
              )}
            >
              <stage.icon className="h-4 w-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold tracking-widest leading-tight">{stage.title}</p>
                <p className="text-[10px] opacity-70 leading-tight truncate">{stage.subtitle}</p>
              </div>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[11px] font-bold',
                  stage.countClass
                )}
              >
                {stageRows.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2 p-2 min-h-[8rem] max-h-[36rem] overflow-y-auto">
              {stageRows.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">Nenhuma campanha</p>
              ) : (
                stageRows.map((row) => (
                  <PipelineCard key={row.id} row={row} accent={stage.accentClass} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
