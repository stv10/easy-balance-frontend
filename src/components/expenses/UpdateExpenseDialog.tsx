import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { UpdateExpenseForm } from './UpdateExpenseForm';
import type { Expense } from '@/types/api';
import { Pencil } from 'lucide-react';

interface UpdateExpenseDialogProps {
  expense: Expense | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const UpdateExpenseDialog: React.FC<UpdateExpenseDialogProps> = ({
  expense,
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
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Pencil className="size-5 text-primary" />
            Editar Gasto
          </DialogTitle>
          <DialogDescription>
            Modifica los detalles del movimiento registrado. Los saldos de las cuentas se actualizarán automáticamente.
          </DialogDescription>
        </DialogHeader>

        {expense && (
          <UpdateExpenseForm
            expense={expense}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
