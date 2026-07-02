// Skeleton screens para Suspense streaming — nenhum 'use client' necessário

// ── Shopee Ads ────────────────────────────────────────────────────────────────

export function ShopeePageSkeleton() {
  return (
    <div className="flex flex-col h-full bg-gray-50 animate-pulse">

      {/* Header */}
      <div className="px-8 pt-7 pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-80 rounded-lg bg-gray-200" />
            <div className="h-3 w-52 rounded bg-gray-100" />
          </div>
          <div className="h-8 w-36 rounded-lg bg-gray-200" />
        </div>
      </div>

      {/* Filtros */}
      <div className="px-8 py-4 flex gap-3 border-b border-gray-200 bg-white shadow-sm">
        {[80, 80, 150, 150, 160].map((w, i) => (
          <div key={i} className="h-9 rounded-lg bg-gray-100" style={{ width: w }} />
        ))}
        <div className="flex-1 h-9 rounded-lg bg-gray-100" />
      </div>

      {/* KPIs */}
      <div className="px-8 pt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm space-y-2">
            <div className="h-2 w-16 rounded bg-gray-200" />
            <div className="h-6 w-20 rounded bg-gray-200" />
            <div className="h-2 w-14 rounded bg-gray-100" />
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="px-8 pt-5 pb-6">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="h-11 bg-gray-50 border-b border-gray-200" />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-3 py-3.5 border-b border-gray-100">
              <div className="h-3 w-3 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-1.5 min-w-[200px]">
                <div className="h-3 w-3/4 rounded bg-gray-200" />
                <div className="h-2 w-1/3 rounded bg-gray-100" />
              </div>
              {Array.from({ length: 9 }).map((_, j) => (
                <div key={j} className="h-3 w-12 rounded bg-gray-200 flex-shrink-0" />
              ))}
              <div className="h-5 w-16 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="h-5 w-8 rounded-md bg-gray-200 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Vendas Mercado Livre ──────────────────────────────────────────────────────

export function MlVendasPageSkeleton() {
  return (
    <div className="flex flex-col h-full bg-gray-50 animate-pulse">

      {/* Header + Filtro */}
      <div className="px-8 pt-7 pb-4 flex items-center justify-between border-b border-gray-200 bg-white shadow-sm">
        <div className="space-y-2">
          <div className="h-6 w-80 rounded-lg bg-gray-200" />
          <div className="h-3 w-52 rounded bg-gray-100" />
        </div>
        <div className="h-9 w-56 rounded-lg bg-gray-100" />
      </div>

      <div className="px-8 py-6 space-y-6">

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-2">
              <div className="h-2 w-24 rounded bg-gray-200" />
              <div className="h-7 w-32 rounded bg-gray-200" />
            </div>
          ))}
        </div>

        {/* Tabela */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="h-11 bg-gray-50 border-b border-gray-200" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-100">
              <div className="h-3 w-16 rounded bg-gray-200 flex-shrink-0" />
              <div className="h-3 flex-1 rounded bg-gray-200" />
              <div className="h-3 w-16 rounded bg-gray-200 flex-shrink-0" />
              <div className="h-3 w-16 rounded bg-gray-200 flex-shrink-0" />
              <div className="h-3 w-10 rounded bg-gray-200 flex-shrink-0" />
              <div className="h-5 w-16 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="h-5 w-32 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="h-5 w-10 rounded-md bg-gray-200 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CRM de Anúncios ───────────────────────────────────────────────────────────

export function CrmPageSkeleton() {
  return (
    <div className="flex flex-col h-full bg-gray-50 animate-pulse">

      {/* Header */}
      <div className="px-8 pt-7 pb-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-48 rounded-lg bg-gray-200" />
            <div className="h-3 w-64 rounded bg-gray-100" />
          </div>
          <div className="flex gap-2">
            {[80, 90, 72, 80].map((w, i) => (
              <div key={i} className="h-7 rounded-full bg-gray-100" style={{ width: w }} />
            ))}
          </div>
        </div>
      </div>

      {/* Colunas Kanban */}
      <div className="flex-1 px-8 py-6 flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, col) => (
          <div key={col} className="flex-shrink-0 w-72 flex flex-col gap-3">
            <div className="h-10 rounded-xl bg-gray-200" />
            {Array.from({ length: col === 0 ? 4 : col === 1 ? 3 : 2 }).map((_, card) => (
              <div key={card} className="rounded-xl border border-gray-200 bg-white shadow-sm p-3 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 rounded bg-gray-200" />
                    <div className="h-2 w-1/2 rounded bg-gray-100" />
                  </div>
                  <div className="h-4 w-8 rounded-full bg-gray-100 flex-shrink-0" />
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[0, 1, 2].map((m) => (
                    <div key={m} className="h-12 rounded-lg bg-gray-100" />
                  ))}
                </div>
                <div className="h-7 rounded-lg bg-gray-200" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Home / Dashboard Geral ───────────────────────────────────────────────────

export function HomePageSkeleton() {
  return (
    <div className="flex flex-col h-full bg-gray-50 animate-pulse">
      <div className="px-8 pt-7 pb-4 space-y-1">
        <div className="h-6 w-56 rounded-lg bg-gray-200" />
        <div className="h-3 w-40 rounded bg-gray-100" />
      </div>
      <div className="px-8 pb-6 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm space-y-2">
              <div className="h-2 w-20 rounded bg-gray-200" />
              <div className="h-7 w-28 rounded bg-gray-200" />
              <div className="h-2 w-16 rounded bg-gray-100" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm h-64" />
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm h-48" />
      </div>
    </div>
  );
}
