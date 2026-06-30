'use client';

import { useState, useTransition, type ReactNode } from 'react';
import { Camera, TrendingUp, Trash2, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CrmProduto, CrmStatus } from '@/types';
import { updateProdutoStatus, registrarTrocaFoto } from '@/app/actions/crm';

// ── Config das colunas ────────────────────────────────────────────────────────

const COLUNAS: { key: CrmStatus; label: string; color: string; headerBg: string; icon: string }[] = [
  { key: 'incubacao',  label: 'Incubação',  color: 'text-blue-700',  headerBg: 'bg-blue-50  border-blue-200',  icon: '🥚' },
  { key: 'otimizacao', label: 'Otimização', color: 'text-amber-700', headerBg: 'bg-amber-50 border-amber-200', icon: '🔧' },
  { key: 'escala',     label: 'Escala',     color: 'text-green-700', headerBg: 'bg-green-50 border-green-200', icon: '🚀' },
  { key: 'descarte',   label: 'Descarte',   color: 'text-red-700',   headerBg: 'bg-red-50   border-red-200',   icon: '🗑️' },
];

const AVATAR_COR: Record<CrmStatus, string> = {
  incubacao:  'bg-blue-500',
  otimizacao: 'bg-amber-500',
  escala:     'bg-green-600',
  descarte:   'bg-red-400',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtPct(v: number) { return v.toFixed(1) + '%'; }

function BadgeTempo({ dias }: { dias: number }) {
  const label = dias === 0 ? 'Hoje' : `${dias}d`;
  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
      dias >= 15 ? 'bg-red-100 text-red-600' :
      dias >= 7  ? 'bg-amber-100 text-amber-600' :
                   'bg-gray-100 text-gray-500',
    )}>
      <Clock className="h-2.5 w-2.5" />
      {label}
    </span>
  );
}

// ── Botão de ação por status ──────────────────────────────────────────────────

type AcaoConfig = { label: string; acao: string; icon: ReactNode; cls: string };

function getAcaoConfig(status: CrmStatus): AcaoConfig {
  switch (status) {
    case 'incubacao':
      return { label: 'Mover p/ Otimização', acao: 'mover-otimizacao',
               icon: <ArrowRight className="h-3 w-3" />,  cls: 'bg-blue-500  hover:bg-blue-600  text-white' };
    case 'otimizacao':
      return { label: 'Registrar Troca de Foto', acao: 'trocar-foto',
               icon: <Camera className="h-3 w-3" />,      cls: 'bg-amber-500 hover:bg-amber-600 text-white' };
    case 'escala':
      return { label: 'Escalar com Ads', acao: 'escalar',
               icon: <TrendingUp className="h-3 w-3" />,  cls: 'bg-green-600 hover:bg-green-700 text-white' };
    case 'descarte':
      return { label: 'Desativar', acao: 'desativar',
               icon: <Trash2 className="h-3 w-3" />,      cls: 'bg-red-500   hover:bg-red-600   text-white' };
  }
}

// ── Card de produto ───────────────────────────────────────────────────────────

interface CardProps {
  produto: CrmProduto;
  onAction: (p: CrmProduto, acao: string) => void;
  feedback: { text: string; ok: boolean } | null;
}

function ProdutoCard({ produto, onAction, feedback }: CardProps) {
  const status   = produto.status_sugerido;
  const inicial  = (produto.name?.[0] ?? '?').toUpperCase();
  const { label, acao, icon, cls } = getAcaoConfig(status);
  const sugestaoVisivel = produto.status_sugerido !== produto.status;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-3 space-y-2.5">

      {/* Cabeçalho do card */}
      <div className="flex items-start gap-2.5">
        <div className={cn(
          'h-8 w-8 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-xs font-bold',
          AVATAR_COR[status],
        )}>
          {inicial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-900 leading-snug line-clamp-2">{produto.name}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            ID: {produto.product_id} · {produto.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        <BadgeTempo dias={produto.dias_no_ciclo} />
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { label: 'CTR', value: fmtPct(produto.ctr),       color: produto.ctr >= 3 ? 'text-green-600' : produto.ctr >= 2 ? 'text-amber-600' : 'text-red-500' },
          { label: 'Conv.',  value: fmtPct(produto.conv_rate), color: produto.conv_rate >= 2 ? 'text-green-600' : produto.conv_rate >= 1 ? 'text-amber-600' : 'text-red-500' },
          { label: 'Pedidos', value: String(produto.total_orders), color: 'text-gray-700' },
        ].map(({ label: l, value, color }) => (
          <div key={l} className="text-center rounded-lg bg-gray-50 py-1.5">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">{l}</p>
            <p className={cn('text-sm font-bold', color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Alerta de sugestão de reclassificação */}
      {sugestaoVisivel && (
        <p className="text-[10px] text-amber-700 font-medium bg-amber-50 rounded-md px-2 py-1">
          ⚡ Sugerido: mover para <strong>{produto.status_sugerido}</strong>
        </p>
      )}

      {/* Botão de ação */}
      <button
        onClick={() => onAction(produto, acao)}
        className={cn(
          'w-full flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-colors',
          cls,
        )}
      >
        {icon}{label}
      </button>

      {/* Feedback inline */}
      {feedback && (
        <p className={cn('text-[10px] text-center font-medium', feedback.ok ? 'text-green-600' : 'text-red-500')}>
          {feedback.text}
        </p>
      )}
    </div>
  );
}

// ── Kanban principal ──────────────────────────────────────────────────────────

interface CrmKanbanProps { produtos: CrmProduto[] }

export function CrmKanban({ produtos }: CrmKanbanProps) {
  const [lista, setLista]   = useState<CrmProduto[]>(produtos);
  const [feedbacks, setFeedbacks] = useState<Map<string, { text: string; ok: boolean }>>(new Map());
  const [, startT]          = useTransition();

  function setFeedback(key: string, fb: { text: string; ok: boolean }) {
    setFeedbacks((prev) => new Map(prev).set(key, fb));
    setTimeout(() => setFeedbacks((prev) => { const n = new Map(prev); n.delete(key); return n; }), 3000);
  }

  function handleAction(produto: CrmProduto, acao: string) {
    const key = `${produto.product_id}-${produto.shop_id}`;
    startT(async () => {
      let result: { error?: string } = {};
      let novoStatus: CrmStatus | null = null;

      if (acao === 'trocar-foto') {
        result    = await registrarTrocaFoto(produto.product_id, produto.shop_id);
        novoStatus = 'otimizacao';
      } else if (acao === 'mover-otimizacao') {
        result    = await updateProdutoStatus(produto.product_id, produto.shop_id, 'otimizacao');
        novoStatus = 'otimizacao';
      } else if (acao === 'escalar') {
        result    = await updateProdutoStatus(produto.product_id, produto.shop_id, 'escala');
        novoStatus = 'escala';
      } else if (acao === 'desativar') {
        result    = await updateProdutoStatus(produto.product_id, produto.shop_id, 'descarte');
        novoStatus = 'descarte';
      }

      if (result.error) {
        setFeedback(key, { text: `Erro: ${result.error}`, ok: false });
      } else {
        if (novoStatus !== null) {
          const s = novoStatus;
          setLista((prev) =>
            prev.map((p) =>
              p.product_id === produto.product_id && p.shop_id === produto.shop_id
                ? { ...p, status: s, status_sugerido: s }
                : p,
            ),
          );
        }
        setFeedback(key, { text: 'Atualizado ✓', ok: true });
      }
    });
  }

  return (
    <div className="flex gap-4 h-full min-h-0">
      {COLUNAS.map((col) => {
        const items = lista.filter((p) => (p.status_sugerido ?? p.status) === col.key);
        return (
          <div key={col.key} className="flex-shrink-0 w-72 flex flex-col gap-3 min-h-0">

            {/* Cabeçalho da coluna */}
            <div className={cn('rounded-xl border px-3 py-2.5 flex items-center justify-between flex-shrink-0', col.headerBg)}>
              <span className={cn('text-sm font-bold flex items-center gap-2', col.color)}>
                <span>{col.icon}</span>{col.label}
              </span>
              <span className={cn('text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center', col.headerBg, col.color)}>
                {items.length}
              </span>
            </div>

            {/* Lista de cards */}
            <div className="flex flex-col gap-2.5 overflow-y-auto flex-1 pb-2">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 rounded-xl border border-dashed border-gray-200 text-gray-400">
                  <p className="text-[11px]">Nenhum produto</p>
                </div>
              ) : (
                items.map((p) => {
                  const key = `${p.product_id}-${p.shop_id}`;
                  return (
                    <ProdutoCard
                      key={key}
                      produto={p}
                      onAction={handleAction}
                      feedback={feedbacks.get(key) ?? null}
                    />
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
