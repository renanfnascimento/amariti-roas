import { cn } from '@/lib/utils';

interface RoasStatusBadgeProps {
  roas: number;
}

export function RoasStatusBadge({ roas }: RoasStatusBadgeProps) {
  const config =
    roas > 7.0
      ? {
          bg: 'bg-green-100',
          text: 'text-green-800',
          label: 'Lucro: Escalar Agressivamente',
        }
      : roas >= 4.0
      ? {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          label: 'Atenção: Otimizar',
        }
      : {
          bg: 'bg-red-100',
          text: 'text-red-800',
          label: 'Prejuízo: Pausar/Reduzir',
        };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        config.bg,
        config.text
      )}
    >
      {config.label}
    </span>
  );
}
