'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import {
  RefreshCw, TrendingUp, TrendingDown, Activity,
  Settings2, Zap, UploadCloud,
} from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { CsvUploader } from './CsvUploader';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PerformanceRow {
  id:                  string;
  shop_id:             number;
  sku:                 string;
  product_name:        string;
  organic_views:       number;
  organic_conversions: number;
  ads_spend:           number;
  ads_conversions:     number;
  roas_score:          number;
  ads_paused:          boolean;
  shopee_diagnosis:    string | null;
  updated_at:          string;
}

export interface ShopeeIntelligencePanelProps {
  shopId1: number;
  shopId2: number;
}

type Tab    = 'all' | 'scale' | 'pause';
type Period = '1d' | '7d' | '30d' | 'all';
type Shop   = 'all' | '1' | '2';

const PAUSE_THRESHOLD = 1.5; // fixo — produtos abaixo disso perdem dinheiro

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: '1d',  label: 'Últimas 24h'    },
  { value: '7d',  label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias'},
  { value: 'all', label: 'Todo o período' },
];

// ── Sub-componentes ───────────────────────────────────────────────────────────

function RoasBadge({ roas, scaleThreshold }: { roas: number; scaleThreshold: number }) {
  const isScale   = roas >= scaleThreshold;
  const isPause   = roas < PAUSE_THRESHOLD;
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap',
      isScale ? 'bg-emerald-100 text-emerald-700' :
      isPause ? 'bg-red-100 text-red-700'         :
                'bg-amber-100 text-amber-700',
    )}>
      {isScale ? <><TrendingUp  className="h-3 w-3" /> Escalar</>   :
       isPause ? <><TrendingDown className="h-3 w-3" /> Pausar Ads</> :
                 <><Activity    className="h-3 w-3" /> Neutro</>}
    </span>
  );
}

function PauseToggle({
  paused, onChange, pending,
}: {
  paused: boolean; onChange: () => void; pending: boolean;
}) {
  return (
    <button
      onClick={onChange}
      disabled={pending}
      title={paused ? 'Pausado — clique para reativar' : 'Ativo — clique para pausar'}
      className={cn(
        'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none',
        paused ? 'bg-gray-300' : 'bg-emerald-400',
        pending && 'opacity-40 cursor-wait',
      )}
    >
      <span className={cn(
        'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform',
        paused ? 'translate-x-0' : 'translate-x-4',
      )} />
    </button>
  );
}

function StatCard({
  label, value, sub, color,
}: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
      <p className={cn('text-xl font-bold mt-0.5', color ?? 'text-gray-900')}>{value}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Badge de Diagnóstico Shopee ───────────────────────────────────────────────

const DIAGNOSIS_STYLES: Record<string, string> = {
  'Otimize Seus ADS':               'bg-red-100 text-red-700 border-red-200',
  'Impulsionar com ADS':            'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Acompanhar Performance dos ADS': 'bg-blue-100 text-blue-700 border-blue-200',
  'Produtos com Melhor Desempenho': 'bg-purple-100 text-purple-700 border-purple-200',
};

// Rótulos curtos para caber na célula
const DIAGNOSIS_SHORT: Record<string, string> = {
  'Otimize Seus ADS':               'Otimizar ADS',
  'Impulsionar com ADS':            'Impulsionar',
  'Acompanhar Performance dos ADS': 'Monitorar',
  'Produtos com Melhor Desempenho': 'Top Produto',
};

function DiagnosisBadge({ value }: { value: string | null }) {
  if (!value) {
    return <span className="text-[10px] text-gray-300">—</span>;
  }
  return (
    <span
      title={value}
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border whitespace-nowrap',
        DIAGNOSIS_STYLES[value] ?? 'bg-gray-100 text-gray-600 border-gray-200',
      )}
    >
      {DIAGNOSIS_SHORT[value] ?? value}
    </span>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-gray-100">
          <td className="px-4 py-3.5">
            <div className="h-3 w-3/4 rounded bg-gray-200 mb-1.5" />
            <div className="h-2 w-1/3 rounded bg-gray-100" />
          </td>
          <td className="px-4 py-3.5"><div className="h-4 w-20 rounded-full bg-gray-200" /></td>
          {Array.from({ length: 7 }).map((_, j) => (
            <td key={j} className="px-4 py-3.5 text-right">
              <div className="h-3 w-12 rounded bg-gray-200 ml-auto" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ── Panel Principal ───────────────────────────────────────────────────────────

export function ShopeeIntelligencePanel({ shopId1, shopId2 }: ShopeeIntelligencePanelProps) {
  const [rows,           setRows]           = useState<PerformanceRow[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<string | null>(null);
  const [tab,            setTab]            = useState<Tab>('all');
  const [shopFilter,     setShopFilter]     = useState<Shop>('all');
  const [period,         setPeriod]         = useState<Period>('7d');
  const [scaleThreshold, setScaleThreshold] = useState(3.0);
  const [showConfig,     setShowConfig]     = useState(false);
  const [showUploader,   setShowUploader]   = useState(false);
  const [lastRefresh,    setLastRefresh]    = useState<Date | null>(null);
  const [pendingIds,     setPendingIds]     = useState<Set<string>>(new Set());
  const [, startT] = useTransition();

  // ── Fetch client-side (não bloqueia o render) ─────────────────────────────
  async function fetchData(shop: Shop, per: Period) {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabase();
      let query = supabase
        .from('shopee_performance_data')
        .select('id,shop_id,sku,product_name,organic_views,organic_conversions,ads_spend,ads_conversions,roas_score,ads_paused,shopee_diagnosis,updated_at')
        .order('roas_score', { ascending: false })
        .range(0, 199);

      if (shop !== 'all') {
        const sid = shop === '1' ? shopId1 : shopId2;
        if (sid > 0) query = query.eq('shop_id', sid);
      }

      if (per !== 'all') {
        const days  = per === '1d' ? 1 : per === '7d' ? 7 : 30;
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('updated_at', since);
      }

      const { data, error: fetchErr } = await query;
      if (fetchErr) throw fetchErr;
      setRows((data ?? []) as PerformanceRow[]);
      setLastRefresh(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(shopFilter, period); }, [shopFilter, period]);

  // ── Quick Edit — toggle ads_paused ────────────────────────────────────────
  function handleToggle(row: PerformanceRow) {
    const newPaused = !row.ads_paused;
    // Optimistic update
    setRows(prev => prev.map(r => r.id === row.id ? { ...r, ads_paused: newPaused } : r));
    setPendingIds(prev => new Set(prev).add(row.id));

    startT(async () => {
      try {
        await getSupabase()
          .from('shopee_performance_data')
          .update({ ads_paused: newPaused })
          .eq('id', row.id);
        // TODO: disparar webhook n8n → pausar/reativar anúncio na Shopee
        console.log(`[intelligence] ads_paused=${newPaused} para ${row.sku} — webhook n8n pendente`);
      } catch {
        // Reverte se a escrita falhar
        setRows(prev => prev.map(r => r.id === row.id ? { ...r, ads_paused: row.ads_paused } : r));
      } finally {
        setPendingIds(prev => { const n = new Set(prev); n.delete(row.id); return n; });
      }
    });
  }

  // ── Dados derivados ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (tab === 'scale') return rows.filter(r => r.roas_score >= scaleThreshold);
    if (tab === 'pause') return rows.filter(r => r.roas_score < PAUSE_THRESHOLD);
    return rows;
  }, [rows, tab, scaleThreshold]);

  const stats = useMemo(() => {
    const total      = rows.length;
    const scaleCount = rows.filter(r => r.roas_score >= scaleThreshold).length;
    const pauseCount = rows.filter(r => r.roas_score < PAUSE_THRESHOLD).length;
    const avgRoas    = total > 0 ? rows.reduce((s, r) => s + r.roas_score, 0) / total : 0;
    const totalSpend = rows.reduce((s, r) => s + r.ads_spend, 0);
    return { total, scaleCount, pauseCount, avgRoas, totalSpend };
  }, [rows, scaleThreshold]);

  const selectClass = 'rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300 cursor-pointer';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* Header */}
      <div className="px-8 pt-7 pb-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Inteligência de Vendas — Shopee</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Dados ingeridos via n8n · Loja{' '}
              {shopFilter === '1' ? 'Renan' : shopFilter === '2' ? 'Amariti' : 'todas'} ·{' '}
              {lastRefresh
                ? `Atualizado às ${lastRefresh.toLocaleTimeString('pt-BR')}`
                : 'Carregando…'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowUploader(v => !v); setShowConfig(false); }}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
                showUploader
                  ? 'border-orange-300 bg-orange-50 text-orange-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
              )}
            >
              <UploadCloud className="h-3.5 w-3.5" />
              Importar CSV
            </button>
            <button
              onClick={() => { setShowConfig(v => !v); setShowUploader(false); }}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
                showConfig
                  ? 'border-orange-300 bg-orange-50 text-orange-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
              )}
            >
              <Settings2 className="h-3.5 w-3.5" />
              Threshold ROAS
            </button>
            <button
              onClick={() => fetchData(shopFilter, period)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-60 transition-colors"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Painel de upload CSV */}
        {showUploader && (
          <div className="mt-3">
            <CsvUploader
              onSuccess={() => fetchData(shopFilter, period)}
              onClose={() => setShowUploader(false)}
            />
          </div>
        )}

        {/* Config de threshold */}
        {showConfig && (
          <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 flex flex-wrap items-center gap-4 text-xs">
            <span className="font-semibold text-orange-700">ROAS mínimo para Escalar:</span>
            <input
              type="number" step="0.5" min="0.5" max="10"
              value={scaleThreshold}
              onChange={e => setScaleThreshold(Math.max(0.5, Number(e.target.value)))}
              className="w-20 rounded-lg border border-orange-300 bg-white px-2 py-1 text-sm font-bold text-orange-700 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <span className="text-orange-500">
              Pausar fixo em <strong>{PAUSE_THRESHOLD}×</strong> · Escalar acima de{' '}
              <strong>{scaleThreshold}×</strong>
            </span>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="px-8 py-4 flex flex-wrap items-center gap-3 border-b border-gray-200 bg-white shadow-sm">
        <select
          value={shopFilter}
          onChange={e => setShopFilter(e.target.value as Shop)}
          className={selectClass}
        >
          <option value="all">Todas as lojas</option>
          <option value="1">Shopee Renan (Loja 1)</option>
          <option value="2">Shopee Amariti (Loja 2)</option>
        </select>

        <select
          value={period}
          onChange={e => setPeriod(e.target.value as Period)}
          className={selectClass}
        >
          {PERIOD_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {error && (
          <span className="text-xs font-medium text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-200">
            ⚠ {error}
          </span>
        )}

        <span className="ml-auto text-[11px] text-gray-400 font-medium">
          {filtered.length} produto{filtered.length !== 1 ? 's' : ''}
          {tab !== 'all' ? ` · aba "${tab === 'scale' ? 'Escalar' : 'Pausar/Otimizar'}"` : ''}
        </span>
      </div>

      {/* KPIs */}
      <div className="px-8 pt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          label="Total Produtos"
          value={String(stats.total)}
          sub="com dados de ads"
        />
        <StatCard
          label="ROAS Médio"
          value={stats.total > 0 ? `${stats.avgRoas.toFixed(2)}×` : '—'}
          sub="período selecionado"
          color={
            stats.avgRoas >= scaleThreshold ? 'text-emerald-600' :
            stats.avgRoas < PAUSE_THRESHOLD  ? 'text-red-600'     : 'text-amber-600'
          }
        />
        <StatCard
          label="Para Escalar 🚀"
          value={String(stats.scaleCount)}
          sub={`ROAS ≥ ${scaleThreshold}×`}
          color="text-emerald-600"
        />
        <StatCard
          label="Para Pausar 🛑"
          value={String(stats.pauseCount)}
          sub={`ROAS < ${PAUSE_THRESHOLD}×`}
          color="text-red-600"
        />
        <StatCard
          label="Gasto Total Ads"
          value={stats.totalSpend.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          sub="período selecionado"
        />
      </div>

      {/* Tabs */}
      <div className="px-8 pt-5 flex gap-1 border-b border-gray-200">
        {([
          { key: 'all'   as Tab, label: 'Visão Geral',        count: rows.length          },
          { key: 'scale' as Tab, label: '🚀 Escalar (Lucro)', count: stats.scaleCount     },
          { key: 'pause' as Tab, label: '🛑 Pausar/Otimizar', count: stats.pauseCount     },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 -mb-px transition-colors',
              tab === t.key
                ? 'border-orange-500 text-orange-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50',
            )}
          >
            {t.label}
            <span className={cn(
              'ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold',
              tab === t.key ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500',
            )}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="flex-1 overflow-auto px-8 py-5">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left   text-[11px] font-semibold uppercase tracking-wide text-gray-400 min-w-[220px]">Produto / SKU</th>
                  <th className="px-4 py-3 text-left   text-[11px] font-semibold uppercase tracking-wide text-gray-400 min-w-[160px]">Diag. Shopee</th>
                  <th className="px-4 py-3 text-right  text-[11px] font-semibold uppercase tracking-wide text-gray-400">Views Org.</th>
                  <th className="px-4 py-3 text-right  text-[11px] font-semibold uppercase tracking-wide text-gray-400">Conv. Org.</th>
                  <th className="px-4 py-3 text-right  text-[11px] font-semibold uppercase tracking-wide text-gray-400">Gasto Ads</th>
                  <th className="px-4 py-3 text-right  text-[11px] font-semibold uppercase tracking-wide text-gray-400">Conv. Ads</th>
                  <th className="px-4 py-3 text-right  text-[11px] font-semibold uppercase tracking-wide text-gray-400">ROAS</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-400">Status</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-400">Pausar Ads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">

                {loading && <SkeletonRows />}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Zap className="h-8 w-8 text-gray-200" />
                        <p className="text-sm font-semibold text-gray-500">
                          {rows.length === 0
                            ? 'Sem dados ainda'
                            : 'Nenhum produto nesta aba'}
                        </p>
                        <p className="text-xs text-gray-400 max-w-xs text-center leading-relaxed">
                          {rows.length === 0
                            ? 'Importe um relatório .xlsx via o botão "Importar CSV" acima para ver os dados aqui.'
                            : 'Mude o filtro de aba ou ajuste o threshold de ROAS.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && filtered.map(row => {
                  const orgConvRate = row.organic_views > 0
                    ? (row.organic_conversions / row.organic_views) * 100
                    : null;

                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        'hover:bg-orange-50/30 transition-colors',
                        row.ads_paused && 'bg-gray-50/60 opacity-70',
                      )}
                    >
                      <td className="px-4 py-3.5">
                        <p className="text-xs font-semibold text-gray-900 leading-snug line-clamp-2">
                          {row.product_name || '(sem nome)'}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{row.sku}</p>
                      </td>

                      <td className="px-4 py-3.5">
                        <DiagnosisBadge value={row.shopee_diagnosis} />
                      </td>

                      <td className="px-4 py-3.5 text-right text-xs text-gray-700">
                        {row.organic_views.toLocaleString('pt-BR')}
                      </td>

                      <td className="px-4 py-3.5 text-right text-xs text-gray-700">
                        {orgConvRate !== null ? `${orgConvRate.toFixed(1)}%` : '—'}
                      </td>

                      <td className="px-4 py-3.5 text-right text-xs font-medium text-gray-900">
                        {row.ads_spend.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>

                      <td className="px-4 py-3.5 text-right text-xs text-gray-700">
                        {row.ads_conversions}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <span className={cn(
                          'text-sm font-bold',
                          row.roas_score >= scaleThreshold ? 'text-emerald-600' :
                          row.roas_score < PAUSE_THRESHOLD  ? 'text-red-600'     : 'text-amber-600',
                        )}>
                          {row.roas_score.toFixed(2)}×
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <RoasBadge roas={row.roas_score} scaleThreshold={scaleThreshold} />
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <PauseToggle
                            paused={row.ads_paused}
                            onChange={() => handleToggle(row)}
                            pending={pendingIds.has(row.id)}
                          />
                          <span className="text-[9px] text-gray-400 font-medium">
                            {row.ads_paused ? 'Pausado' : 'Ativo'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
