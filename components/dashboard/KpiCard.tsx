import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string;
  changePercent?: number;
  lowerIsBetter?: boolean;
  className?: string;
}

export function KpiCard({ title, value, changePercent, lowerIsBetter = false, className }: KpiCardProps) {
  const isImprovement =
    changePercent === undefined
      ? null
      : lowerIsBetter
      ? changePercent < 0
      : changePercent >= 0;

  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col gap-1', className)}>
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
      {changePercent !== undefined && isImprovement !== null && (
        <div
          className={cn(
            'flex items-center gap-1 text-xs font-semibold mt-1',
            isImprovement ? 'text-emerald-600' : 'text-red-500'
          )}
        >
          {isImprovement ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          <span>
            {changePercent >= 0 ? '+' : ''}
            {changePercent.toFixed(1)}% vs mês ant.
          </span>
        </div>
      )}
    </div>
  );
}
