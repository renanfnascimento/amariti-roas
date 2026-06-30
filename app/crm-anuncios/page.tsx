// revalidate = 30 → ISR: dados frescos a cada 30s sem bloquear a navegação.
// Suspense faz o layout aparecer instantaneamente.

import { Suspense } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { CrmKanban } from '@/components/dashboard/CrmKanban';
import { CrmPageSkeleton } from '@/components/dashboard/PageSkeletons';
import { getCrmProdutos } from '@/app/actions/crm';

export const revalidate = 30;

export default function CrmAnunciosPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<CrmPageSkeleton />}>
        <CrmContent />
      </Suspense>
    </DashboardLayout>
  );
}

async function CrmContent() {
  const produtos = await getCrmProdutos();

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="px-8 pt-7 pb-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">CRM de Anúncios</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Ciclo de vida dos produtos · {produtos.length} produto{produtos.length !== 1 ? 's' : ''} gerenciado{produtos.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2 text-[11px] font-medium text-gray-500">
            <span className="flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-blue-700">🥚 Incubação</span>
            <span className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-amber-700">🔧 Otimização</span>
            <span className="flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-green-700">🚀 Escala</span>
            <span className="flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-red-700">🗑️ Descarte</span>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto px-8 py-6">
        <CrmKanban produtos={produtos} />
      </div>
    </div>
  );
}
