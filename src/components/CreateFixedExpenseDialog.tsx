import React, { useState } from 'react';
import { useApi } from '@/context/ApiContext';
import type { FixedExpense, Tag } from '@/types/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TagSelect } from '@/components/ui/TagSelect';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface CreateFixedExpenseDialogProps {
  onExpenseAdded?: () => void;
  trigger?: React.ReactNode;
}

export const CreateFixedExpenseDialog: React.FC<CreateFixedExpenseDialogProps> = ({
  onExpenseAdded,
  trigger,
}) => {
  const { addFixedExpense } = useApi();
  const [open, setOpen] = useState(false);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('VIDA');
  const [dueDay, setDueDay] = useState('');
  const [tagId, setTagId] = useState<string | undefined>(undefined);
  const [selectedTag, setSelectedTag] = useState<Tag | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['VIDA', 'OCIO', 'INVERSION'];

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategory('VIDA');
    setDueDay('');
    setTagId(undefined);
    setSelectedTag(undefined);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const desc = description.trim();
    const numAmount = parseFloat(amount);
    if (!desc || isNaN(numAmount) || numAmount <= 0) {
      toast.error('Ingrese una descripción y un monto válido');
      return;
    }

    setIsSubmitting(true);
    try {
      const fixedExpense: FixedExpense = {
        description: desc,
        amount: numAmount,
        category,
        dueDay: dueDay ? parseInt(dueDay) : undefined,
        tag: selectedTag,
        tagId,
      };

      await addFixedExpense(fixedExpense);
      toast.success('Gasto fijo maestro agregado');
      resetForm();
      setOpen(false);
      onExpenseAdded?.();
    } catch (err: any) {
      toast.error(err?.message || 'Error al agregar el gasto fijo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          trigger ? (
            (trigger as any)
          ) : (
            <Button size="sm" className="h-8 text-xs font-semibold">
              <Plus data-icon="inline-start" />
              Nuevo Gasto Fijo
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            Crear Gasto Fijo Maestro
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Define una plantilla de gasto fijo para planificar los pagos mensuales.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">
              Descripción
            </label>
            <Input
              placeholder="ej. Alquiler, Internet, Expensas"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="h-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Monto ($)
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="h-9"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Día de Vencimiento
              </label>
              <Input
                type="number"
                min="1"
                max="31"
                placeholder="1 - 31"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Categoría
              </label>
              <Select value={category} onValueChange={(val) => setCategory(val || 'VIDA')}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Etiqueta
              </label>
              <TagSelect
                value={tagId}
                onChange={(newId, newTag) => {
                  setTagId(newId);
                  setSelectedTag(newTag);
                }}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 mt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="h-9"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!description.trim() || !amount || parseFloat(amount) <= 0 || isSubmitting}
              className="h-9 font-semibold"
            >
              Guardar Gasto Fijo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
