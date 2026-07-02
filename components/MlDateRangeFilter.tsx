'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { CalendarRange } from 'lucide-react';

export function MlDateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';

  function updateParam(key: 'from' | 'to', value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
      <CalendarRange className="h-4 w-4 text-gray-400 flex-shrink-0" />
      <input
        type="date"
        value={from}
        onChange={(e) => updateParam('from', e.target.value)}
        className="text-sm text-gray-700 focus:outline-none"
        aria-label="Data inicial"
      />
      <span className="text-gray-400 text-sm">até</span>
      <input
        type="date"
        value={to}
        onChange={(e) => updateParam('to', e.target.value)}
        className="text-sm text-gray-700 focus:outline-none"
        aria-label="Data final"
      />
    </div>
  );
}
