import React, { useState, useEffect } from 'react';
import { useApi } from '@/context/ApiContext';
import type { Expense, MonthlyTagSummary, TagMonthHistory } from '@/types/api';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { TagIcon } from '@/components/ui/TagIcon';
import { TagHistoryBarChart } from './TagHistoryBarChart';
import { TagSelect } from '@/components/ui/TagSelect';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  CalendarDays,
  Tags,
  CheckSquare,
  Square,
  Tag as TagIconLucide,
  Trash2,
  X,
  Loader2,
} from 'lucide-react';
import { UNTAGGED_COLOR } from '@/lib/tag-icons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TagDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tagSummary: MonthlyTagSummary | null;
  yearMonth: string;
  onExpensesUpdated?: () => void;
}

export const TagDetailSheet: React.FC<TagDetailSheetProps> = ({
  open,
  onOpenChange,
  tagSummary,
  yearMonth,
  onExpensesUpdated,
}) => {
  const {
    tags,
    getTagHistory,
    getExpensesByTag,
    updateExpenseTag,
    bulkUpdateExpenseTag,
  } = useApi();

  const [historyData, setHistoryData] = useState<TagMonthHistory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isBulkTagPopoverOpen, setIsBulkTagPopoverOpen] = useState(false);

  const tagColor = tagSummary?.tagColor || UNTAGGED_COLOR;

  const loadData = async () => {
    if (!tagSummary) return;
    setIsLoading(true);
    try {
      const [history, items] = await Promise.all([
        getTagHistory(tagSummary.tagId, yearMonth),
        getExpensesByTag(tagSummary.tagId, yearMonth),
      ]);
      setHistoryData(history);
      setExpenses(items);
      setSelectedIds([]);
    } catch (err) {
      console.error('Error loading tag detail:', err);
      toast.error('Error al cargar datos de la etiqueta');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && tagSummary) {
      loadData();
    } else {
      setSelectedIds([]);
    }
  }, [open, tagSummary, yearMonth]);

  const formatCurrency = (val: number) => {
    return `$${Math.round(val).toLocaleString('es-AR')}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === expenses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(expenses.map((e) => e.id!).filter(Boolean));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Single item tag change
  const handleSingleTagChange = async (expenseId: string, newTagId?: string) => {
    try {
      await updateExpenseTag(expenseId, newTagId || null);
      toast.success('Etiqueta actualizada');
      await loadData();
      onExpensesUpdated?.();
    } catch (err: any) {
      toast.error(err?.message || 'Error al cambiar la etiqueta');
    }
  };

  // Bulk tag change
  const handleBulkTagChange = async (newTagId: string | null) => {
    if (selectedIds.length === 0) return;
    setIsBulkUpdating(true);
    try {
      await bulkUpdateExpenseTag(selectedIds, newTagId);
      toast.success(
        newTagId
          ? `Etiqueta asignada a ${selectedIds.length} gastos`
          : `Etiqueta quitada de ${selectedIds.length} gastos`
      );
      setIsBulkTagPopoverOpen(false);
      await loadData();
      onExpensesUpdated?.();
    } catch (err: any) {
      toast.error(err?.message || 'Error al actualizar gastos en lote');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl overflow-y-auto flex flex-col gap-5 p-4 sm:p-6"
      >
        <SheetHeader className="text-left pb-2 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div
              className="size-10 rounded-xl border flex items-center justify-center shrink-0 shadow-xs"
              style={{
                backgroundColor: `${tagColor}1a`,
                borderColor: `${tagColor}40`,
                color: tagColor,
              }}
            >
              <TagIcon name={tagSummary?.tagIcon} className="size-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <SheetTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-foreground truncate">
                {tagSummary?.tagName || 'Etiqueta'}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Desglose analítico y administración de gastos del mes {yearMonth}
              </SheetDescription>
            </div>
          </div>

          <div className="mt-3 flex items-baseline justify-between bg-muted/40 p-3 rounded-xl border border-border/50">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
                Total del Mes
              </span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">
                {formatCurrency(tagSummary?.totalAmount || 0)}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[11px] font-semibold text-muted-foreground">
                Participación
              </span>
              <Badge
                variant="secondary"
                className="font-mono text-xs font-bold px-2 py-0.5 mt-0.5"
                style={{
                  backgroundColor: `${tagColor}18`,
                  color: tagColor,
                  borderColor: `${tagColor}35`,
                }}
              >
                {tagSummary?.percentage.toFixed(1)}% del total
              </Badge>
            </div>
          </div>
        </SheetHeader>

        {/* 6-Month Bar Chart */}
        <div className="flex flex-col gap-2 bg-muted/20 p-3.5 rounded-xl border border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-primary" />
              Evolución en 6 Meses
            </span>
            <span className="text-[10px] text-muted-foreground">
              (Mes seleccionado resaltado)
            </span>
          </div>

          <TagHistoryBarChart
            data={historyData}
            tagColor={tagColor}
            isLoading={isLoading}
          />
        </div>

        {/* Individual Expenses Section */}
        <div className="flex flex-col gap-3 flex-1 min-h-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Tags className="size-3.5 text-primary" />
              Gastos Individuales ({expenses.length})
            </span>
            {expenses.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleSelectAll}
                className="h-7 text-xs text-muted-foreground hover:text-foreground cursor-pointer gap-1.5"
              >
                {selectedIds.length === expenses.length ? (
                  <CheckSquare className="size-3.5 text-primary" />
                ) : (
                  <Square className="size-3.5" />
                )}
                {selectedIds.length === expenses.length
                  ? 'Deseleccionar todos'
                  : 'Seleccionar todos'}
              </Button>
            )}
          </div>

          {/* Bulk Action Bar (Visible when 1+ selected) */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-primary/10 border border-primary/25 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs font-semibold px-2">
                  {selectedIds.length} seleccionados
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedIds([])}
                  className="size-6 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Cancelar selección"
                >
                  <X className="size-3.5" />
                </Button>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Popover to select tag in bulk */}
                <Popover
                  open={isBulkTagPopoverOpen}
                  onOpenChange={setIsBulkTagPopoverOpen}
                >
                  <PopoverTrigger
                    render={
                      <Button
                        size="sm"
                        disabled={isBulkUpdating}
                        className="h-7 text-xs gap-1.5 cursor-pointer"
                      >
                        {isBulkUpdating ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <TagIconLucide className="size-3" />
                        )}
                        Cambiar etiqueta
                      </Button>
                    }
                  />
                  <PopoverContent align="end" className="w-56 p-2 z-50">
                    <span className="text-xs font-semibold text-foreground px-1 pb-1 block border-b border-border/60 mb-1">
                      Asignar a los seleccionados:
                    </span>
                    <div className="max-h-48 overflow-y-auto flex flex-col gap-0.5">
                      {tags.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleBulkTagChange(t.id)}
                          className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted text-xs text-foreground cursor-pointer text-left transition-colors"
                        >
                          <div
                            className="size-5 rounded-sm border flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: `${t.color || '#3b82f6'}1a`,
                              borderColor: `${t.color || '#3b82f6'}40`,
                              color: t.color || '#3b82f6',
                            }}
                          >
                            <TagIcon name={t.icon} className="size-3" />
                          </div>
                          <span className="truncate">{t.name}</span>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Bulk Untag */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBulkUpdating}
                  onClick={() => handleBulkTagChange(null)}
                  className="h-7 text-xs gap-1 text-muted-foreground hover:text-destructive cursor-pointer"
                  title="Quitar etiqueta a los seleccionados"
                >
                  <Trash2 className="size-3" />
                  <span className="hidden sm:inline">Quitar etiqueta</span>
                </Button>
              </div>
            </div>
          )}

          {/* Table / List */}
          {isLoading ? (
            <div className="flex flex-col gap-2 py-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : expenses.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs border border-dashed rounded-xl border-border/80">
              No hay gastos en esta etiqueta para el mes seleccionado.
            </div>
          ) : (
            <div className="border border-border/70 rounded-xl overflow-hidden shadow-2xs">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-9 px-2 text-center">
                      <span className="sr-only">Seleccionar</span>
                    </TableHead>
                    <TableHead className="text-xs">Fecha / Detalle</TableHead>
                    <TableHead className="text-xs text-right">Monto</TableHead>
                    <TableHead className="text-xs w-36 sm:w-40">Etiqueta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => {
                    const isSelected = selectedIds.includes(expense.id!);

                    return (
                      <TableRow
                        key={expense.id}
                        className={cn(
                          'transition-colors',
                          isSelected ? 'bg-primary/5' : 'hover:bg-muted/30'
                        )}
                      >
                        <TableCell className="px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleSelectOne(expense.id!)}
                            className="text-muted-foreground hover:text-foreground cursor-pointer inline-flex items-center justify-center"
                          >
                            {isSelected ? (
                              <CheckSquare className="size-4 text-primary" />
                            ) : (
                              <Square className="size-4" />
                            )}
                          </button>
                        </TableCell>
                        <TableCell className="py-2.5">
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-xs text-foreground truncate">
                              {expense.description}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-muted-foreground">
                                {formatDate(expense.createdAt)}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1 py-0 h-3.5 text-muted-foreground"
                              >
                                {expense.category}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-xs text-foreground py-2.5">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell className="py-2.5">
                          {/* Inline Tag Select */}
                          <TagSelect
                            value={expense.tag?.id}
                            onChange={(newId) => handleSingleTagChange(expense.id!, newId)}
                            placeholder="Sin etiqueta"
                            className="h-7 text-xs w-full"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
