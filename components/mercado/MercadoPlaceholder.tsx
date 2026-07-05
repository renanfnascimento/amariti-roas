import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';

interface MercadoPlaceholderProps {
  title:       string;
  description: string;
}

/** Esqueleto padrão das páginas do módulo Mercado enquanto as ferramentas não são plugadas. */
export function MercadoPlaceholder({ title, description }: MercadoPlaceholderProps) {
  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">{description}</p>

        <div className="mt-10 flex justify-center">
          <Card className="w-full max-w-2xl border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <Construction className="h-8 w-8 text-gray-300" />
              <p className="text-sm font-medium text-gray-600">
                Em breve: a ferramenta de análise entrará aqui.
              </p>
              <p className="text-xs text-gray-400">
                Este módulo está em construção como parte da Inteligência de Mercado.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
