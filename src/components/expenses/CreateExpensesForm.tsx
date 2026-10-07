import React, { useState, useId, useCallback } from 'react';
import { useApi } from '@/context/ApiContext';
import type { CreateExpenseDTO, Tag } from '@/types/api';
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
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ExpenseRowItem {
  id: string;
  date: Date;
  description: string;
  amount: string;
  category: string;
  accountId: string;
  tagId: string | undefined;
  tag?: Tag;
}

const CATEGORIES = ['VIDA', 'OCIO', 'INVERSION'] as const;

interface CreateExpensesFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateExpensesForm: React.FC<CreateExpensesFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { accounts, createExpenses } = useApi();
  const idPrefix = useId();

  const createInitialRow = useCallback((): ExpenseRowItem => ({
    id: `${idPrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    date: new Date(),
    description: '',
    amount: '',
    category: 'VIDA',
    accountId: 'NONE',
    tagId: undefined,
  }), [idPrefix]);

  const [rows, setRows] = useState<ExpenseRowItem[]>([createInitialRow()]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddRow = () => {
    setRows((prev) => [...prev, createInitialRow()]);
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateRow = <K extends keyof ExpenseRowItem>(
    index: number,
    field: K,
    value: ExpenseRowItem[K]
  ) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const isValid = rows.every((row) => {
    const desc = row.description.trim();
    const amt = parseFloat(row.amount);
    return desc.length > 0 && !isNaN(amt) && amt > 0;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const dtos: CreateExpenseDTO[] = rows.map((r) => {
        // Adjust date to ISO or keep local date
        const createdAt = r.date.toISOString();
        return {
          description: r.description.trim(),
          amount: parseFloat(r.amount),
          category: r.category,
          createdAt,
          accountId: r.accountId !== 'NONE' ? r.accountId : null,
          tagId: r.tagId || null,
        };
      });

      await createExpenses(dtos);
      toast.success(
        rows.length === 1
          ? 'Gasto registrado con éxito'
          : `${rows.length} gastos registrados con éxito`
      );
      onSuccess?.();
    } catch (err) {
      toast.error('Error al registrar los gastos');
    } finally {
      setIsSubmitting(false);
    }
  };

    const totalAmount = rows.reduce((sum, r) => {
      const v = parseFloat(r.amount);
      return isNaN(v) ? sum : sum + v;
    }, 0);

    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-3.5 max-h-[58vh] overflow-y-auto overflow-x-hidden pr-1.5">
          {rows.map((row, index) => (
            <div
              key={row.id}
              className="bg-muted/25 hover:bg-muted/35 transition-colors p-3.5 sm:p-4 rounded-xl border border-border/80 flex flex-col gap-3 relative shadow-xs"
            >
              {/* Card Header: Item number & delete button */}
              <div className="flex items-center justify-between pb-1 border-b border-border/40">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <span className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold">
                    {index + 1}
                  </span>
                  Gasto #{index + 1}
                </span>

                {rows.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRow(index)}
                    className="text-muted-foreground hover:text-destructive h-7 px-2 text-xs gap-1.5 cursor-pointer"
                    title="Eliminar este gasto"
                  >
                    <Trash2 className="size-3.5" />
                    <span className="hidden sm:inline">Quitar</span>
                  </Button>
                )}
              </div>

              {/* Row 1: Fecha (col-3), Descripción (col-6), Monto (col-3) */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                <div className="sm:col-span-3 flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Fecha
                  </label>
                  <DatePicker
                    date={row.date}
                    onSelect={(selected) =>
                      handleUpdateRow(index, 'date', selected || new Date())
                    }
                  />
                </div>

                <div className="sm:col-span-6 flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Descripción
                  </label>
                  <Input
                    placeholder="ej. Supermercado, Farmacia, Nafta..."
                    value={row.description}
                    onChange={(e) =>
                      handleUpdateRow(index, 'description', e.target.value)
                    }
                    required
                    className="h-9"
                  />
                </div>

                <div className="sm:col-span-3 flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Monto ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={row.amount}
                    onChange={(e) =>
                      handleUpdateRow(index, 'amount', e.target.value)
                    }
                    required
                    className="h-9 font-semibold"
                  />
                </div>
              </div>

              {/* Row 2: Categoría (col-4), Cuenta (col-4), Etiqueta (col-4) */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                <div className="sm:col-span-4 flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Categoría
                  </label>
                  <Select
                    value={row.category}
                    onValueChange={(val) =>
                      handleUpdateRow(index, 'category', val || 'VIDA')
                    }
                  >
                    <SelectTrigger className="h-9 bg-card">
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

                <div className="sm:col-span-4 flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Cuenta
                  </label>
                  <Select
                    value={row.accountId}
                    onValueChange={(val) =>
                      handleUpdateRow(index, 'accountId', val || 'NONE')
                    }
                  >
                    <SelectTrigger className="h-9 bg-card">
                      <SelectValue placeholder="Cuenta">
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

                <div className="sm:col-span-4 flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Etiqueta (opcional)
                  </label>
                  <TagSelect
                    value={row.tagId}
                    onChange={(tagId, tag) => {
                      handleUpdateRow(index, 'tagId', tagId);
                      handleUpdateRow(index, 'tag', tag);
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/60">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddRow}
              className="w-full sm:w-auto cursor-pointer gap-1.5 font-medium"
            >
              <Plus className="size-4" />
              Agregar fila
            </Button>
            {totalAmount > 0 && (
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Total: <strong className="text-foreground font-mono font-bold">${totalAmount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={!isValid || isSubmitting}
              className="w-full sm:w-auto font-medium cursor-pointer gap-1.5"
            >
              {isSubmitting && <Loader2 className="animate-spin size-4" />}
              Registrar {rows.length} {rows.length === 1 ? 'gasto' : 'gastos'}
            </Button>
          </div>
        </div>
      </form>
    );
  };
