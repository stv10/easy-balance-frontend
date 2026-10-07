import React, { useState, useEffect } from 'react';
import { useApi } from '@/context/ApiContext';
import type { Expense, UpdateExpenseDTO } from '@/types/api';
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
import { DatePicker } from '@/components/ui/date-picker';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UpdateExpenseFormProps {
  expense: Expense;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CATEGORIES = ['VIDA', 'OCIO', 'INVERSION'] as const;

export const UpdateExpenseForm: React.FC<UpdateExpenseFormProps> = ({
  expense,
  onSuccess,
  onCancel,
}) => {
  const { accounts, updateExpenses } = useApi();

  const [description, setDescription] = useState(expense.description || '');
  const [amount, setAmount] = useState(expense.amount ? expense.amount.toString() : '');
  const [category, setCategory] = useState(expense.category || 'VIDA');
  const [accountId, setAccountId] = useState(expense.accountId || 'NONE');
  const [tagId, setTagId] = useState<string | undefined>(expense.tag?.id || expense.tagId);
  const [date, setDate] = useState<Date>(
    expense.createdAt ? new Date(expense.createdAt) : new Date()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setDescription(expense.description || '');
    setAmount(expense.amount ? expense.amount.toString() : '');
    setCategory(expense.category || 'VIDA');
    setAccountId(expense.accountId || 'NONE');
    setTagId(expense.tag?.id || expense.tagId);
    setDate(expense.createdAt ? new Date(expense.createdAt) : new Date());
  }, [expense]);

  const isValid =
    description.trim().length > 0 &&
    !isNaN(parseFloat(amount)) &&
    parseFloat(amount) > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting || !expense.id) return;

    setIsSubmitting(true);
    try {
      const dto: UpdateExpenseDTO = {
        id: expense.id,
        description: description.trim(),
        amount: parseFloat(amount),
        category,
        createdAt: date.toISOString(),
        accountId: accountId !== 'NONE' ? accountId : null,
        tagId: tagId || null,
        fixedExpenseId: expense.fixedExpenseId || null,
      };

      await updateExpenses([dto]);
      toast.success('Gasto actualizado con éxito');
      onSuccess?.();
    } catch (err) {
      toast.error('Error al actualizar el gasto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">
            Fecha
          </label>
          <DatePicker
            date={date}
            onSelect={(selected) => setDate(selected || new Date())}
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">
            Descripción
          </label>
          <Input
            placeholder="Descripción (ej. Supermercado)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="h-9"
          />
        </div>

        {/* Amount */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase">
            Monto ($)
          </label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Monto ($)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="h-9"
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase">
            Categoría
          </label>
          <Select
            value={category}
            onValueChange={(val) => setCategory(val || 'VIDA')}
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Account */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase">
            Cuenta
          </label>
          <Select
            value={accountId}
            onValueChange={(val) => setAccountId(val || 'NONE')}
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="Cuenta (Opcional)">
                {(val) => {
                  if (!val || val === 'NONE') return 'Ninguna';
                  return accounts.find((a) => a.id === val)?.name || 'Ninguna';
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">Ninguna</SelectItem>
              {accounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id || 'NONE'}>
                  {acc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tag */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase">
            Etiqueta
          </label>
          <TagSelect
            value={tagId}
            onChange={(selectedId) => setTagId(selectedId)}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="font-medium"
        >
          {isSubmitting && <Loader2 className="animate-spin size-4 mr-2" />}
          Guardar Cambios
        </Button>
      </div>
    </form>
  );
};
