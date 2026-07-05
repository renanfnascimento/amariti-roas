import { DashboardLayout } from '@/components/DashboardLayout';
import { CompetitorsGrid } from '@/components/mercado/CompetitorsGrid';
import { getMarketCompetitors } from '@/app/actions/mercado';

export const metadata = { title: 'Concorrência da página · Amariti ROAS' };

// Dados chegam via webhook do n8n — renderização em tempo real, sem cache do
// App Router, para a vitrine refletir o Supabase imediatamente após a ingestão.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ConcorrenciaPage() {
  const competitors = await getMarketCompetitors();

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Concorrência da página</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitoramento dos concorrentes diretos dos seus anúncios no Mercado Livre: preço, volume de vendas e posicionamento.
        </p>

        <div className="mt-8">
          <CompetitorsGrid competitors={competitors} />
        </div>
      </div>
    </DashboardLayout>
  );
}
