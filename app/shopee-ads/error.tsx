'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ShopeeAdsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[ShopeeAdsError]', error);
  }, [error]);

  return (
    <div className="flex h-full min-h-[60vh] items-center justify-center p-8">
      <div className="w-full max-w-md rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
          <h2 className="text-base font-semibold text-red-900">
            Erro na página Shopee Ads
          </h2>
        </div>
        <p className="text-sm text-red-700 mb-6 leading-relaxed bg-red-100 rounded-lg px-3 py-2 font-mono break-all">
          {error.message || 'Erro inesperado.'}
        </p>
        <button
          onClick={reset}
          className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    </div>
  );
}
