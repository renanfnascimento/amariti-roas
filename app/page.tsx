// revalidate = 30 → ISR: métricas do dashboard renovadas a cada 30s.
// Suspense faz o layout aparecer instantaneamente ao trocar de aba.

import { Suspense } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ShopeeDashboard } from '@/components/dashboard/ShopeeDashboard';
import { HomePageSkeleton } from '@/components/dashboard/PageSkeletons';
import { getShopeeMetrics } from '@/app/actions/shopee';

export const revalidate = 30;

export default function HomePage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<HomePageSkeleton />}>
        <HomeContent />
      </Suspense>
    </DashboardLayout>
  );
}

async function HomeContent() {
  const metrics = await getShopeeMetrics();
  return <ShopeeDashboard metrics={metrics} />;
}
