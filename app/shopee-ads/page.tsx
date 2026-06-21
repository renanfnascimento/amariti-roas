import { DashboardLayout } from '@/components/DashboardLayout';
import { ShopeeProductsPanel } from '@/components/dashboard/ShopeeProductsPanel';
import { getShopeeProducts } from '@/app/actions/products';

export const dynamic = 'force-dynamic';

export default async function ShopeeAdsPage() {
  const products = await getShopeeProducts('shopee-renan');

  return (
    <DashboardLayout>
      <ShopeeProductsPanel products={products} />
    </DashboardLayout>
  );
}
