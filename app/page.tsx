import { DashboardLayout } from '@/components/DashboardLayout';
import { CampaignTable } from '@/components/CampaignTable';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { getShopeeMetrics } from '@/app/actions/shopee';

export default async function HomePage() {
  const metrics = await getShopeeMetrics();

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitoramento de ROAS em tempo real — Shopee
          </p>
        </div>

        <Tabs defaultValue="hoje">
          <TabsList className="mb-6">
            <TabsTrigger value="hoje">Hoje</TabsTrigger>
            <TabsTrigger value="ontem">Ontem</TabsTrigger>
            <TabsTrigger value="7dias">Últimos 7 dias</TabsTrigger>
          </TabsList>

          <TabsContent value="hoje">
            <CampaignTable rows={metrics} />
          </TabsContent>
          <TabsContent value="ontem">
            <CampaignTable rows={metrics} />
          </TabsContent>
          <TabsContent value="7dias">
            <CampaignTable rows={metrics} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
