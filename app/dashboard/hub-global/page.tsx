// Sem force-dynamic — searchParams já torna a página dinâmica em Next.js 15.
// Suspense faz o layout chegar imediatamente; dados chegam via streaming.

import { Suspense } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { HubGlobalPanel } from '@/components/dashboard/HubGlobalPanel';
import { MlVendasPageSkeleton } from '@/components/dashboard/PageSkeletons';
import { getMlPerformance } from '@/app/actions/ml';
import { getShopeePerformanceRoas } from '@/app/actions/shopee';

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default function HubGlobalPage({ searchParams }: PageProps) {
  return (
    <DashboardLayout>
      <Suspense fallback={<MlVendasPageSkeleton />}>
        <HubGlobalContent searchParams={searchParams} />
      </Suspense>
    </DashboardLayout>
  );
}

async function HubGlobalContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const [mlRows, shopeeRows] = await Promise.all([
    getMlPerformance(params.from, params.to),
    getShopeePerformanceRoas(params.from, params.to),
  ]);

  return <HubGlobalPanel mlRows={mlRows} shopeeRows={shopeeRows} />;
}
