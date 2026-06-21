import { DashboardLayout } from '@/components/DashboardLayout';
import { ShopeeDashboard } from '@/components/dashboard/ShopeeDashboard';
import { getShopeeMetrics } from '@/app/actions/shopee';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const metrics = await getShopeeMetrics();

  return (
    <DashboardLayout>
      <ShopeeDashboard metrics={metrics} />
    </DashboardLayout>
  );
}
