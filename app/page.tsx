'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { RoasBadge } from '@/components/RoasBadge';
import { QuickEditCampaignDialog } from '@/components/QuickEditCampaignDialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Campaign, ShopeeMetrics } from '@/types';
import { Pencil } from 'lucide-react';

const mockCampaigns: Campaign[] = [
  { id: '1', platform: 'SHOPEE', nome_campanha: 'Linha Verão — Biquínis Premium', status_ativo: true, orcamento_diario: 150 },
  { id: '2', platform: 'SHOPEE', nome_campanha: 'Promoção Shorts Femininos', status_ativo: true, orcamento_diario: 80 },
  { id: '3', platform: 'SHOPEE', nome_campanha: 'Coleção Moda Praia 2025', status_ativo: false, orcamento_diario: 200 },
  { id: '4', platform: 'SHOPEE', nome_campanha: 'Flash Sale — Saídas de Praia', status_ativo: true, orcamento_diario: 50 },
  { id: '5', platform: 'SHOPEE', nome_campanha: 'Acessórios Verão — Chapéus', status_ativo: true, orcamento_diario: 30 },
];

const mockMetrics: Record<string, ShopeeMetrics> = {
  '1': { id: 'm1', campaign_id: '1', data: '2026-06-21', valor_gasto_ads: 142.50, valor_faturado: 683.20, roas_calculado: 4.79, margem_contribuicao: 0.38 },
  '2': { id: 'm2', campaign_id: '2', data: '2026-06-21', valor_gasto_ads: 78.00, valor_faturado: 163.80, roas_calculado: 2.10, margem_contribuicao: 0.22 },
  '3': { id: 'm3', campaign_id: '3', data: '2026-06-21', valor_gasto_ads: 0, valor_faturado: 0, roas_calculado: 0, margem_contribuicao: 0 },
  '4': { id: 'm4', campaign_id: '4', data: '2026-06-21', valor_gasto_ads: 49.90, valor_faturado: 61.20, roas_calculado: 1.23, margem_contribuicao: 0.10 },
  '5': { id: 'm5', campaign_id: '5', data: '2026-06-21', valor_gasto_ads: 28.00, valor_faturado: 112.00, roas_calculado: 4.00, margem_contribuicao: 0.35 },
};

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function HomePage() {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleEdit(campaign: Campaign) {
    setSelectedCampaign(campaign);
    setDialogOpen(true);
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>
          <p className="text-sm text-gray-500 mt-1">Monitoramento de ROAS em tempo real — Shopee</p>
        </div>

        <Tabs defaultValue="hoje">
          <TabsList className="mb-6">
            <TabsTrigger value="hoje">Hoje</TabsTrigger>
            <TabsTrigger value="ontem">Ontem</TabsTrigger>
            <TabsTrigger value="7dias">Últimos 7 dias</TabsTrigger>
          </TabsList>

          {['hoje', 'ontem', '7dias'].map((period) => (
            <TabsContent key={period} value={period}>
              <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Campanha</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">Orç. Diário</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">Investido</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">Faturamento</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">ROAS</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mockCampaigns.map((campaign) => {
                      const m = mockMetrics[campaign.id];
                      return (
                        <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-900">{campaign.nome_campanha}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${campaign.status_ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                              {campaign.status_ativo ? 'Ativa' : 'Pausada'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700">{fmt(campaign.orcamento_diario)}</td>
                          <td className="px-4 py-3 text-right text-gray-700">{fmt(m.valor_gasto_ads)}</td>
                          <td className="px-4 py-3 text-right text-gray-700">{fmt(m.valor_faturado)}</td>
                          <td className="px-4 py-3 text-center">
                            {m.roas_calculado > 0 ? (
                              <RoasBadge roas={m.roas_calculado} />
                            ) : (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleEdit(campaign)}
                              className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                            >
                              <Pencil className="h-3 w-3" />
                              Editar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <QuickEditCampaignDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        campaign={selectedCampaign}
      />
    </DashboardLayout>
  );
}
