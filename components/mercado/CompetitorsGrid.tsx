import { ExternalLink, ImageOff, Radar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { MarketCompetitor } from '@/types';
import { cn } from '@/lib/utils';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// Acima deste volume de vendas o concorrente é tratado como consolidado
// (badge verde); abaixo, como emergente (badge laranja).
const HIGH_SALES_THRESHOLD = 50;

export function CompetitorsGrid({ competitors }: { competitors: MarketCompetitor[] }) {
  if (competitors.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <Radar className="h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-600">
            Nenhum concorrente monitorado ainda.
          </p>
          <p className="text-xs text-gray-400">
            Os anúncios aparecerão aqui assim que o workflow do n8n enviar a primeira carga.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {competitors.map((c) => (
        <Card key={c.ml_item_id} className="overflow-hidden flex flex-col">

          {/* Imagem do produto */}
          <div className="h-44 bg-gray-100 flex items-center justify-center overflow-hidden">
            {c.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element -- domínio mlstatic.com não configurado no next/image
              <img
                src={c.thumbnail_url}
                alt={c.title}
                loading="lazy"
                className="h-full w-full object-contain"
              />
            ) : (
              <ImageOff className="h-8 w-8 text-gray-300" />
            )}
          </div>

          <CardContent className="flex flex-col flex-1 gap-2 p-4">
            <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2" title={c.title}>
              {c.title}
            </p>

            <p className="text-lg font-bold text-gray-900">{brl.format(c.price)}</p>

            <div className="mt-auto flex items-center justify-between pt-2">
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                  c.sold_quantity >= HIGH_SALES_THRESHOLD
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700',
                )}
              >
                {c.sold_quantity.toLocaleString('pt-BR')} vendas
              </span>

              {c.permalink && (
                <a
                  href={c.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-orange-500 transition-colors"
                >
                  Ver no ML
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
