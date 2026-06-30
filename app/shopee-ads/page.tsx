// Sem force-dynamic — searchParams já torna a página dinâmica em Next.js 15.
// Suspense faz o layout chegar imediatamente; dados chegam via streaming.

import { Suspense } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ShopeeProductsPanel } from '@/components/dashboard/ShopeeProductsPanel';
import { ShopeePageSkeleton } from '@/components/dashboard/PageSkeletons';
import { getShopeeProducts } from '@/app/actions/products';

interface PageProps {
  searchParams: Promise<{ shop?: string }>;
}

export default function ShopeeAdsPage({ searchParams }: PageProps) {
  return (
    <DashboardLayout>
      <Suspense fallback={<ShopeePageSkeleton />}>
        <ShopeeAdsContent searchParams={searchParams} />
      </Suspense>
    </DashboardLayout>
  );
}

async function ShopeeAdsContent({ searchParams }: PageProps) {
  const params     = await searchParams;
  const shopIndex: 1 | 2 = params.shop === '2' ? 2 : 1;
  const account    = shopIndex === 2 ? 'shopee-amariti' : 'shopee-renan';
  const products   = await getShopeeProducts(account, undefined, undefined, shopIndex);

  return <ShopeeProductsPanel products={products} initialAccount={account} />;
}
