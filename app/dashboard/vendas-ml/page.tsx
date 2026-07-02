// Sem force-dynamic — searchParams já torna a página dinâmica em Next.js 15.
// Suspense faz o layout chegar imediatamente; dados chegam via streaming.

import { Suspense } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MlVendasPanel } from '@/components/dashboard/MlVendasPanel';
import { MlVendasPageSkeleton } from '@/components/dashboard/PageSkeletons';
import { getMlPerformance, getTrafficPerformanceAds } from '@/app/actions/ml';

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default function VendasMlPage({ searchParams }: PageProps) {
  return (
    <DashboardLayout>
      <Suspense fallback={<MlVendasPageSkeleton />}>
        <VendasMlContent searchParams={searchParams} />
      </Suspense>
    </DashboardLayout>
  );
}

async function VendasMlContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const [rows, trafficAdsRows] = await Promise.all([
    getMlPerformance(params.from, params.to),
    getTrafficPerformanceAds(params.from, params.to),
  ]);

  return <MlVendasPanel rows={rows} trafficAdsRows={trafficAdsRows} />;
}
