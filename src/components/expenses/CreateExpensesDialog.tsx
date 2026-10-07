import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CreateExpensesForm } from './CreateExpensesForm';
import { ShoppingCart } from 'lucide-react';

interface CreateExpensesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreateExpensesDialog: React.FC<CreateExpensesDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] flex flex-col p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <ShoppingCart className="size-5 text-primary" />
            Registrar Nuevos Gastos
          </DialogTitle>
          <DialogDescription>
            Carga uno o varios gastos en lista. Puedes añadir tantas filas como necesites antes de guardar.
          </DialogDescription>
        </DialogHeader>

        <CreateExpensesForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};
