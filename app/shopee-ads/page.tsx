export const dynamic = 'force-dynamic';

import { DashboardLayout } from '@/components/DashboardLayout';
import { ShopeeProductsPanel } from '@/components/dashboard/ShopeeProductsPanel';
import { getShopeeProducts } from '@/app/actions/products';

interface PageProps {
  searchParams: Promise<{ shop?: string }>;
}

export default async function ShopeeAdsPage({ searchParams }: PageProps) {
  const params     = await searchParams;
  const shopIndex: 1 | 2 = params.shop === '2' ? 2 : 1;
  const account    = shopIndex === 2 ? 'shopee-amariti' : 'shopee-renan';
  const products   = await getShopeeProducts(account, undefined, undefined, shopIndex);

  return (
    <DashboardLayout>
      <ShopeeProductsPanel products={products} initialAccount={account} />
    </DashboardLayout>
  );
}
