// Página server-side — lê shop IDs do env e passa para o panel client-side.
// O panel faz fetch client-side (useEffect) → render nunca é bloqueado.

import { DashboardLayout } from '@/components/DashboardLayout';
import { ShopeeIntelligencePanel } from '@/components/intelligence/ShopeeIntelligencePanel';

export default function ShopeeIntelligencePage() {
  const shopId1 = Number(process.env.SHOPEE_SHOP_ID_1 ?? '0');
  const shopId2 = Number(process.env.SHOPEE_SHOP_ID_2 ?? '0');

  return (
    <DashboardLayout>
      <ShopeeIntelligencePanel shopId1={shopId1} shopId2={shopId2} />
    </DashboardLayout>
  );
}
