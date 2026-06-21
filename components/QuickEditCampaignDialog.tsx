'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Campaign } from '@/types';

interface QuickEditCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign | null;
}

export function QuickEditCampaignDialog({
  open,
  onOpenChange,
  campaign,
}: QuickEditCampaignDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Campanha</DialogTitle>
          <DialogDescription>
            {campaign ? campaign.nome_campanha : ''}
          </DialogDescription>
        </DialogHeader>
        {/* Formulário de edição rápida de orçamento — a implementar */}
      </DialogContent>
    </Dialog>
  );
}
