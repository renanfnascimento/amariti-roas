import { cn } from '@/lib/utils';

interface RoasBadgeProps {
  roas: number;
}

export function RoasBadge({ roas }: RoasBadgeProps) {
  const config =
    roas >= 3.0
      ? {
          bg: 'bg-green-100',
          text: 'text-green-800',
          label: `${roas.toFixed(2)}x — Escalar`,
        }
      : roas >= 1.5
      ? {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          label: `${roas.toFixed(2)}x — Alerta`,
        }
      : {
          bg: 'bg-red-100',
          text: 'text-red-800',
          label: `${roas.toFixed(2)}x — Pausar`,
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
