'use client';

import { useState, useMemo, useTransition } from 'react';
import { ExternalLink, AlertTriangle, Info, Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { syncShopeeProductsData } from '@/app/actions/products';
import { cn } from '@/lib/utils';
import { ShopeeProductData, Diagnosis, analyzeProduct } from '@/types';

// ── Paginação ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

// ── Fallback mock (dados reais do Gestor) ─────────────────────────────────────

const MOCK: ShopeeProductData[] = [
  {
    shopee_product_id: '11698694233',
    product_name: 'Kit 3 Calças Jogger Slim Malha Crepe Feminina',
    price: 119.92, account: 'shopee-renan', date: '2026-06-21',
    impressions: 26,   clicks: 1,  orders: 1, units: 1,
    product_visitors: 1,  cart_visitors: 1,  revenue: 119.92,
    ctr: 3.85, order_conv_rate: 100.00, cart_conv_rate: 100.00,
    sku: null, estoque_tiny: null,
  },
  {
    shopee_product_id: '18465873199',
    product_name: 'Calça Feminina Malha Crepe Jogger Faixa Lateral',
    price: 118.26, account: 'shopee-renan', date: '2026-06-21',
    impressions: 1358, clicks: 56, orders: 1, units: 3,
    product_visitors: 46, cart_visitors: 8,  revenue: 118.26,
    ctr: 4.12, order_conv_rate: 1.79, cart_conv_rate: 17.39,
    sku: null, estoque_tiny: null,
  },
  {
    shopee_product_id: '23994919436',
    product_name: 'Kit 2 Calças Jogger feminina com elástico Listra na Lateral colorida em Crepe',
    price: 78.92, account: 'shopee-renan', date: '2026-06-21',
    impressions: 1326, clicks: 39, orders: 1, units: 1,
    product_visitors: 35, cart_visitors: 5,  revenue: 78.92,
    ctr: 2.94, order_conv_rate: 2.56, cart_conv_rate: 14.29,
    sku: null, estoque_tiny: null,
  },
  {
    shopee_product_id: '19499092538',
    product_name: 'Conjunto Feminino Tricolor Crepe',
    price: 47.94, account: 'shopee-renan', date: '2026-06-21',
    impressions: 248,  clicks: 12, orders: 1, units: 1,
    product_visitors: 11, cart_visitors: 0,  revenue: 47.94,
    ctr: 4.84, order_conv_rate: 8.33, cart_conv_rate: 0.00,
    sku: null, estoque_tiny: null,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtNum(v: number) { return v.toLocaleString('pt-BR'); }
function fmtPct(v: number) { return v.toFixed(2) + '%'; }

function ctrClass(ctr: number, impressions: number) {
  if (impressions < 100) return 'bg-gray-100 text-gray-500';
  if (ctr >= 4)          return 'bg-emerald-100 text-emerald-700';
  if (ctr >= 2)          return 'bg-yellow-100 text-yellow-700';
  return                        'bg-red-100 text-red-700';
}

function convClass(conv: number, clicks: number) {
  if (clicks < 20) return 'bg-gray-100 text-gray-500';
  if (conv >= 3)   return 'bg-emerald-100 text-emerald-700';
  if (conv >= 1)   return 'bg-yellow-100 text-yellow-700';
  return                  'bg-red-100 text-red-700';
}

function cartConvClass(conv: number, visitors: number) {
  if (visitors < 5) return 'bg-gray-100 text-gray-500';
  if (conv >= 20)   return 'bg-emerald-100 text-emerald-700';
  if (conv >= 10)   return 'bg-yellow-100 text-yellow-700';
  return                   'bg-red-100 text-red-700';
}

function priorityIcon(diagnoses: Diagnosis[]) {
  if (diagnoses.some((d) => d.type === 'critical')) return '🔴';
  if (diagnoses.some((d) => d.type === 'warning'))  return '🟡';
  return '🟢';
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function MetricBadge({ value, className }: { value: string; className: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold', className)}>
      {value}
    </span>
  );
}

function DiagnosisTags({ diagnoses }: { diagnoses: Diagnosis[] }) {
  if (diagnoses.length === 0) return <span className="text-xs text-gray-300">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {diagnoses.map((d, i) => (
        <span
          key={i}
          title={d.action}
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold cursor-help',
            d.type === 'critical' ? 'bg-red-100 text-red-700' :
            d.type === 'warning'  ? 'bg-amber-100 text-amber-700' :
                                    'bg-gray-100 text-gray-500',
          )}
        >
          <span>{d.icon}</span>
          {d.label}
        </span>
      ))}
    </div>
  );
}

interface ThSortableProps {
  col: keyof ShopeeProductData;
  label: string;
  right?: boolean;
  sortBy: keyof ShopeeProductData;
  sortAsc: boolean;
  onSort: (col: keyof ShopeeProductData) => void;
}
function ThSortable({ col, label, right, sortBy, sortAsc, onSort }: ThSortableProps) {
  return (
    <th
      onClick={() => onSort(col)}
      className={cn(
        'px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400 cursor-pointer select-none whitespace-nowrap hover:text-gray-700 transition-colors',
        right ? 'text-right' : 'text-left',
      )}
    >
      {label} {sortBy === col ? (sortAsc ? '↑' : '↓') : ''}
    </th>
  );
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// Skeleton para 7 linhas durante o sincronismo
function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 7 }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-gray-100">
          <td className="px-3 py-3"><div className="h-3 w-4 rounded bg-gray-200 mx-auto" /></td>
          <td className="px-3 py-3">
            <div className="h-3 rounded bg-gray-200 w-3/4 mb-1.5" />
            <div className="h-2 rounded bg-gray-100 w-1/2" />
          </td>
          {Array.from({ length: 12 }).map((_, j) => (
            <td key={j} className="px-3 py-3 text-right">
              <div className="h-3 rounded bg-gray-200 w-10 ml-auto" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ── Panel Principal ───────────────────────────────────────────────────────────

interface ShopeeProductsPanelProps {
  products:        ShopeeProductData[];
  initialAccount?: string;
}

export function ShopeeProductsPanel({ products, initialAccount = 'shopee-renan' }: ShopeeProductsPanelProps) {
  const [search,      setSearch]      = useState('');
  const [filterAlert, setFilterAlert] = useState<'all' | 'critical' | 'warning'>('all');
  const [dateFrom,    setDateFrom]    = useState('2026-06-01');
  const [dateTo,      setDateTo]      = useState('2026-06-21');
  const [account,     setAccount]     = useState(initialAccount);
  const [sortBy,      setSortBy]      = useState<keyof ShopeeProductData>('impressions');
  const [sortAsc,     setSortAsc]     = useState(false);
  const [page,        setPage]        = useState(0);
  const [syncMsg,     setSyncMsg]     = useState<{ ok: boolean; text: string } | null>(null);
  const [isSyncing,   startSync]      = useTransition();

  function handleSync() {
    setSyncMsg(null);
    const shopIndex: 1 | 2 = account === 'shopee-amariti' ? 2 : 1;
    startSync(async () => {
      const result = await syncShopeeProductsData(account, shopIndex, dateFrom, dateTo);
      if (result.error) {
        setSyncMsg({ ok: false, text: `Erro: ${result.error}` });
      } else {
        const t = result.timing;
        const detail = t ? ` (API ${t.shopeeApiMs}ms · DB ${t.supabaseMs}ms)` : '';
        setSyncMsg({ ok: true, text: `${result.synced} produto${result.synced !== 1 ? 's' : ''} sincronizado${result.synced !== 1 ? 's' : ''}${detail} · Recarregue para ver` });
      }
    });
  }

  const isDemo = products.length === 0;
  const rows   = isDemo ? MOCK : products;

  const enriched = useMemo(() => rows.map((p) => ({ ...p, diagnoses: analyzeProduct(p) })), [rows]);

  const filtered = useMemo(() => {
    return enriched
      .filter((p) => {
        if (search && !p.product_name.toLowerCase().includes(search.toLowerCase()) &&
            !p.shopee_product_id.includes(search)) return false;
        if (filterAlert === 'critical' && !p.diagnoses.some((d) => d.type === 'critical')) return false;
        if (filterAlert === 'warning'  && !p.diagnoses.some((d) => d.type !== 'ok')) return false;
        return true;
      })
      .sort((a, b) => {
        const va = a[sortBy] as number;
        const vb = b[sortBy] as number;
        return sortAsc ? va - vb : vb - va;
      });
  }, [enriched, search, filterAlert, sortBy, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages - 1);
  const paginated  = useMemo(
    () => filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE),
    [filtered, safePage],
  );

  const totals = useMemo(() => {
    const s = enriched.reduce(
      (acc, p) => ({
        impressions:      acc.impressions + p.impressions,
        clicks:           acc.clicks + p.clicks,
        orders:           acc.orders + p.orders,
        units:            acc.units + p.units,
        product_visitors: acc.product_visitors + p.product_visitors,
        revenue:          acc.revenue + p.revenue,
      }),
      { impressions: 0, clicks: 0, orders: 0, units: 0, product_visitors: 0, revenue: 0 },
    );
    return {
      ...s,
      avgCtr:  s.impressions > 0 ? (s.clicks / s.impressions) * 100 : 0,
      avgConv: s.clicks      > 0 ? (s.orders / s.clicks) * 100 : 0,
    };
  }, [enriched]);

  const criticalCount = enriched.filter((p) => p.diagnoses.some((d) => d.type === 'critical')).length;
  const warningCount  = enriched.filter((p) => p.diagnoses.some((d) => d.type === 'warning')).length;

  function toggleSort(col: keyof ShopeeProductData) {
    if (sortBy === col) setSortAsc((v) => !v);
    else { setSortBy(col); setSortAsc(false); }
    setPage(0);
  }

  const selectClass = 'rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300 cursor-pointer';

  const firstItem = filtered.length > 0 ? safePage * PAGE_SIZE + 1 : 0;
  const lastItem  = Math.min((safePage + 1) * PAGE_SIZE, filtered.length);

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* Header */}
      <div className="px-8 pt-7 pb-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Inteligência de Produtos — Shopee</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Orgânico + Pago · Conta: <span className="font-semibold text-gray-600">
                {account === 'shopee-amariti' ? 'Shopee Amariti' : 'Shopee Renan'}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                <AlertTriangle className="h-3.5 w-3.5" />
                {criticalCount} produto{criticalCount > 1 ? 's' : ''} crítico{criticalCount > 1 ? 's' : ''}
              </span>
            )}
            {warningCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                <Info className="h-3.5 w-3.5" />
                {warningCount} em atenção
              </span>
            )}

            {syncMsg && (
              <span className={cn(
                'text-xs font-medium px-2 py-1 rounded-md max-w-xs truncate',
                syncMsg.ok ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700',
              )}>
                {syncMsg.text}
              </span>
            )}

            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-60 transition-colors"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isSyncing && 'animate-spin')} />
              {isSyncing ? 'Consultando Shopee API...' : 'Sincronizar Dados'}
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="px-8 py-4 flex flex-wrap items-center gap-3 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">De</label>
          <input
            type="date" value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
            className={selectClass}
          />
          <label className="text-xs font-medium text-gray-500">até</label>
          <input
            type="date" value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
            className={selectClass}
          />
        </div>

        <select
          value={account}
          onChange={(e) => { setAccount(e.target.value); setPage(0); }}
          className={selectClass}
        >
          <option value="shopee-renan">Shopee Renan</option>
          <option value="shopee-amariti">Shopee Amariti</option>
        </select>

        <select
          value={filterAlert}
          onChange={(e) => { setFilterAlert(e.target.value as typeof filterAlert); setPage(0); }}
          className={selectClass}
        >
          <option value="all">Todos os alertas</option>
          <option value="critical">🔴 Apenas críticos</option>
          <option value="warning">🟡 Com atenção</option>
        </select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar produto ou ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className={cn(selectClass, 'w-full pl-8')}
          />
        </div>

        <span className="ml-auto text-[11px] text-gray-400 font-medium">
          {isDemo
            ? `${filtered.length} produtos (demo)`
            : `${firstItem}–${lastItem} de ${filtered.length} produtos (BD)`}
        </span>
      </div>

      <div className="flex-1 overflow-auto px-8 py-6 space-y-5">

        {/* KPI Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <SummaryCard label="Impressões"  value={fmtNum(totals.impressions)}      sub="total do período" />
          <SummaryCard label="Cliques"     value={fmtNum(totals.clicks)}           sub={`CTR médio: ${fmtPct(totals.avgCtr)}`} />
          <SummaryCard label="Visitantes"  value={fmtNum(totals.product_visitors)} sub="visitantes únicos" />
          <SummaryCard label="Pedidos"     value={fmtNum(totals.orders)}           sub={`Conv: ${fmtPct(totals.avgConv)}`} />
          <SummaryCard label="Unidades"    value={fmtNum(totals.units)}            sub="itens vendidos" />
          <SummaryCard label="Faturamento" value={totals.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} sub="período" />
        </div>

        {/* Legenda */}
        <div className="flex flex-wrap gap-4 text-xs text-gray-500 items-center">
          <span className="font-semibold text-gray-600">Guia de diagnóstico:</span>
          <span className="flex items-center gap-1.5"><span className="text-base">📸</span> CTR baixo → trocar foto de capa / título</span>
          <span className="flex items-center gap-1.5"><span className="text-base">📦</span> Conv. baixa → verificar estoque, sazonalidade, preço</span>
          <span className="flex items-center gap-1.5"><span className="text-base">🛒</span> Abandono → revisar frete, parcelamento, fotos internas</span>
          <span className="flex items-center gap-1.5"><span className="text-base">📊</span> Volume baixo → aguardar mais dados antes de decisões</span>
        </div>

        {/* Tabela de Produtos */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">

          {/* Banner de loading durante sync */}
          {isSyncing && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 border-b border-orange-100 text-xs font-medium text-orange-700">
              <RefreshCw className="h-3.5 w-3.5 animate-spin flex-shrink-0" />
              Consultando a Shopee API — isso pode levar alguns segundos…
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1100px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 w-8">#</th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 min-w-[240px]">Produto</th>
                  <ThSortable col="impressions"      label="Impressões"  right sortBy={sortBy} sortAsc={sortAsc} onSort={toggleSort} />
                  <ThSortable col="clicks"           label="Cliques"     right sortBy={sortBy} sortAsc={sortAsc} onSort={toggleSort} />
                  <ThSortable col="ctr"              label="CTR"         right sortBy={sortBy} sortAsc={sortAsc} onSort={toggleSort} />
                  <ThSortable col="product_visitors" label="Visitantes"  right sortBy={sortBy} sortAsc={sortAsc} onSort={toggleSort} />
                  <ThSortable col="cart_visitors"    label="Carrinho"    right sortBy={sortBy} sortAsc={sortAsc} onSort={toggleSort} />
                  <ThSortable col="cart_conv_rate"   label="Conv.Cart"   right sortBy={sortBy} sortAsc={sortAsc} onSort={toggleSort} />
                  <ThSortable col="orders"           label="Pedidos"     right sortBy={sortBy} sortAsc={sortAsc} onSort={toggleSort} />
                  <ThSortable col="units"            label="Unidades"    right sortBy={sortBy} sortAsc={sortAsc} onSort={toggleSort} />
                  <ThSortable col="order_conv_rate"  label="Conv.Ped."   right sortBy={sortBy} sortAsc={sortAsc} onSort={toggleSort} />
                  <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-400 whitespace-nowrap">Estoque (Tiny)</th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400 min-w-[180px]">Diagnóstico</th>
                  <th className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-400">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">

                {/* Skeleton durante sincronismo */}
                {isSyncing && <SkeletonRows />}

                {/* Dados reais paginados */}
                {!isSyncing && paginated.map((p) => (
                  <tr key={p.shopee_product_id} className="hover:bg-orange-50/30 transition-colors group">

                    <td className="px-3 py-3 text-center text-base leading-none">
                      {priorityIcon(p.diagnoses)}
                    </td>

                    <td className="px-3 py-3">
                      <p className="font-medium text-gray-900 text-xs leading-snug line-clamp-2 max-w-[230px]">
                        {p.product_name}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        ID: {p.shopee_product_id} · {p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </td>

                    <td className="px-3 py-3 text-right text-xs text-gray-700 font-medium">{fmtNum(p.impressions)}</td>
                    <td className="px-3 py-3 text-right text-xs text-gray-700 font-medium">{fmtNum(p.clicks)}</td>

                    <td className="px-3 py-3 text-right">
                      <MetricBadge value={fmtPct(p.ctr)} className={ctrClass(p.ctr, p.impressions)} />
                    </td>

                    <td className="px-3 py-3 text-right text-xs text-gray-700 font-medium">{fmtNum(p.product_visitors)}</td>
                    <td className="px-3 py-3 text-right text-xs text-gray-700 font-medium">{fmtNum(p.cart_visitors)}</td>

                    <td className="px-3 py-3 text-right">
                      <MetricBadge value={fmtPct(p.cart_conv_rate)} className={cartConvClass(p.cart_conv_rate, p.cart_visitors)} />
                    </td>

                    <td className="px-3 py-3 text-right text-xs font-bold text-gray-900">{fmtNum(p.orders)}</td>
                    <td className="px-3 py-3 text-right text-xs text-gray-700 font-medium">{fmtNum(p.units)}</td>

                    <td className="px-3 py-3 text-right">
                      <MetricBadge value={fmtPct(p.order_conv_rate)} className={convClass(p.order_conv_rate, p.clicks)} />
                    </td>

                    <td className="px-3 py-3 text-right">
                      {p.estoque_tiny === null ? (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 whitespace-nowrap">
                          Não Vinculado
                        </span>
                      ) : p.estoque_tiny === 0 ? (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                          0 · Sem Estoque
                        </span>
                      ) : (
                        <span className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold',
                          p.estoque_tiny <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700',
                        )}>
                          {p.estoque_tiny} un.
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-3"><DiagnosisTags diagnoses={p.diagnoses} /></td>

                    <td className="px-3 py-3 text-center">
                      <a
                        href={`https://shopee.com.br/product/${p.shopee_product_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md bg-orange-500 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-orange-600 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Ver
                      </a>
                    </td>
                  </tr>
                ))}

                {/* Empty state */}
                {!isSyncing && paginated.length === 0 && (
                  <tr>
                    <td colSpan={14} className="px-4 py-12 text-center text-sm text-gray-400">
                      {isDemo
                        ? 'Nenhum dado. Clique em Sincronizar para buscar da Shopee.'
                        : 'Nenhum produto com os filtros aplicados.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {!isSyncing && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">
                {firstItem}–{lastItem} de {filtered.length} produto{filtered.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-gray-200 disabled:opacity-40 hover:bg-white transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Anterior
                </button>
                <span className="px-2 text-xs text-gray-500 font-medium">
                  {safePage + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={safePage >= totalPages - 1}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-gray-200 disabled:opacity-40 hover:bg-white transition-colors"
                >
                  Próxima <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
