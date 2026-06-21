'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { updateCampaignBudget } from '@/app/actions/shopee';

interface QuickEditCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string | null;
  campaignName: string | null;
  currentBudget: number;
}

export function QuickEditCampaignDialog({
  open,
  onOpenChange,
  campaignId,
  campaignName,
  currentBudget,
}: QuickEditCampaignDialogProps) {
  // Initializa com o valor atual. O componente é re-montado via `key` no pai
  // quando a campanha muda, então não precisamos de useEffect aqui.
  const [budget, setBudget] = useState(currentBudget);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (!campaignId) return;
    startTransition(async () => {
      await updateCampaignBudget(campaignId, budget);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Orçamento</DialogTitle>
          <DialogDescription>{campaignName ?? ''}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <label className="block text-sm font-medium text-gray-700">
            Orçamento Diário (R$)
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
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
              disabled={isPending || !campaignId}
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
