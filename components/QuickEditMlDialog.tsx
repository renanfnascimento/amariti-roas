'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { updateMlPerformance } from '@/app/actions/ml';

interface QuickEditMlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rowId: string | null;
  campaignName: string | null;
  currentAdSpend: number;
  currentRevenue: number;
}

export function QuickEditMlDialog({
  open,
  onOpenChange,
  rowId,
  campaignName,
  currentAdSpend,
  currentRevenue,
}: QuickEditMlDialogProps) {
  // Initializa com os valores atuais. O componente é re-montado via `key` no pai
  // quando a linha muda, então não precisamos de useEffect aqui.
  const [adSpend, setAdSpend] = useState(currentAdSpend);
  const [revenue, setRevenue] = useState(currentRevenue);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (!rowId) return;
    startTransition(async () => {
      await updateMlPerformance(rowId, { ad_spend: adSpend, revenue });
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Performance</DialogTitle>
          <DialogDescription>{campaignName ?? ''}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <label className="block text-sm font-medium text-gray-700">
            Investimento em Ads (R$)
            <input
              type="number"
              value={adSpend}
              onChange={(e) => setAdSpend(Number(e.target.value))}
              min={0}
              step={0.01}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Faturamento (R$)
            <input
              type="number"
              value={revenue}
              onChange={(e) => setRevenue(Number(e.target.value))}
              min={0}
              step={0.01}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isPending || !rowId}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
