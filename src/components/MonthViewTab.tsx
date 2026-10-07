import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import type { Expense, MonthlyFixedExpense, SSPFilter, CreateExpenseDTO } from '../types/api';
import { MonthSelector, formatMonthDisplay } from './MonthSelector';
import { TagIcon } from '@/components/ui/TagIcon';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  Circle,
  Undo2,
  Check,
  Plus,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  SearchX,
  AlertCircle,
  RotateCcw,
  Loader2,
  SlidersHorizontal,
  Pencil
} from 'lucide-react';
import { CreateExpensesDialog } from './expenses/CreateExpensesDialog';
import { UpdateExpenseDialog } from './expenses/UpdateExpenseDialog';

export const MonthViewTab: React.FC = () => {
  const {
    summary,
    accounts,
    isLoading,
    loadAll,
    getExpensesSSP,
    addExpense,
    deleteExpense,
    generateMonthlyExpenses,
    regenerateMonthlyExpenses,
    updateMonthlyBudget,
    resetMonthlyBudget,
    expenseVersion,
  } = useApi();

  // Month selector state
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Regeneration dialog states
  const [isRegenerateDialogOpen, setIsRegenerateDialogOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Month Budget dialog states
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [budgetTotalAmount, setBudgetTotalAmount] = useState<number>(0);
  const [budgetVidaPct, setBudgetVidaPct] = useState<number>(50);
  const [budgetOcioPct, setBudgetOcioPct] = useState<number>(30);
  const [budgetInversionPct, setBudgetInversionPct] = useState<number>(20);
  const [isSavingBudget, setIsSavingBudget] = useState(false);
  const [isResettingBudget, setIsResettingBudget] = useState(false);

  // Mobile active tab view state
  const [activeMobileView, setActiveMobileView] = useState<'fixed' | 'variable'>('fixed');

  // Expenses SSP table state
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Filters state
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterAccount, setFilterAccount] = useState<string>('ALL');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Expense dialog states
  const [isCreateExpensesOpen, setIsCreateExpensesOpen] = useState(false);
  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false);
  const [selectedExpenseForEdit, setSelectedExpenseForEdit] = useState<Expense | null>(null);

  // Fixed expenses payment inputs mapping: feId -> { amount, accountId }
  const [paymentInputs, setPaymentInputs] = useState<{
    [key: string]: { amount: string; accountId: string };
  }>({});

  const categories = ['VIDA', 'OCIO', 'INVERSION'];

  // Format helpers
  const toYearMonthStr = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  };

  // Sync date range filters when currentDate changes
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const endStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    setFilterDateFrom(startStr);
    setFilterDateTo(endStr);
    setPageIndex(0);
  }, [currentDate]);

  // Load all when selected month changes
  useEffect(() => {
    loadAll(toYearMonthStr(currentDate));
  }, [currentDate]);

  // Synchronize payment inputs when summary or accounts update
  useEffect(() => {
    if (!summary || !summary.fixedExpenses) return;
    const defaultAccountId = accounts.length > 0 ? (accounts[0].id || 'NONE') : 'NONE';

    setPaymentInputs(prev => {
      const updated = { ...prev };
      let changed = false;

      summary.fixedExpenses.forEach(fe => {
        if (!fe.paid && !updated[fe.id]) {
          updated[fe.id] = {
            amount: fe.amount.toString(),
            accountId: defaultAccountId
          };
          changed = true;
        }
      });

      return changed ? updated : prev;
    });
  }, [summary, accounts]);

  // Load expenses on filter/pagination changes
  const loadExpensesList = async () => {
    const filters: SSPFilter[] = [];
    if (filterCategory !== 'ALL') {
      filters.push({ key: 'category', value: filterCategory });
    }
    if (filterAccount !== 'ALL') {
      filters.push({ key: 'accountId', value: filterAccount });
    }
    if (filterDateFrom) {
      filters.push({ key: 'fechasDesde', value: filterDateFrom });
    }
    if (filterDateTo) {
      filters.push({ key: 'fechasHasta', value: filterDateTo });
    }

    const request = {
      pageIndex,
      pageSize,
      filters
    };

    try {
      const response = await getExpensesSSP(request);
      setExpenses(response.data);
      setTotalItems(response.totalItems);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  useEffect(() => {
    loadExpensesList();
  }, [pageIndex, pageSize, filterCategory, filterAccount, filterDateFrom, filterDateTo, expenseVersion]);

  // Calculations mirroring Angular methods and custom balances
  const totalRealBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const unpaidPlannedExpenses = (summary?.fixedExpenses ?? [])
    .filter(fe => !fe.paid)
    .reduce((sum, fe) => sum + (fe.amount || 0), 0);
  const remainingRealBalance = totalRealBalance - unpaidPlannedExpenses;

  const getCategorySpent = (cat: string): number => {
    if (!summary || !summary.categories) return 0;
    const catData = summary.categories[cat];
    if (!catData) return 0;

    const variableSum = catData.totalVariableExpenses || 0;
    const paidFixedSum = (summary.fixedExpenses ?? [])
      .filter(fe => fe.category === cat && fe.paid)
      .reduce((sum, fe) => sum + (fe.actualAmount || 0), 0);

    return variableSum + paidFixedSum;
  };

  const getCategoryReserved = (cat: string): number => {
    if (!summary || !summary.fixedExpenses) return 0;
    return summary.fixedExpenses
      .filter(fe => fe.category === cat && !fe.paid)
      .reduce((sum, fe) => sum + fe.amount, 0);
  };

  const getCategoryPercentage = (cat: string): number => {
    if (!summary || !summary.categories || !summary.categories[cat]) return 0;
    const assigned = summary.categories[cat].assignedBudget;
    if (assigned <= 0) return 0;
    const spent = getCategorySpent(cat);
    return Math.min(100, Math.round((spent / assigned) * 100));
  };

  const getAccountName = (id?: string) => {
    if (!id || id === 'NONE') return '-';
    return accounts.find(a => a.id === id)?.name || '-';
  };

  // Actions
  const handleDeleteExpense = async (id?: string) => {
    if (!id) return;
    if (!confirm('¿Estás seguro de que deseas eliminar este gasto?')) return;
    try {
      await deleteExpense(id);
      toast.success('Gasto eliminado con éxito');
      loadAll(toYearMonthStr(currentDate));
      loadExpensesList();
    } catch (err) {
      toast.error('Error al eliminar el gasto');
    }
  };

  const handlePayFixedExpense = async (fe: MonthlyFixedExpense) => {
    const input = paymentInputs[fe.id];
    if (!input) return;
    const amount = parseFloat(input.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Ingrese un monto de pago válido');
      return;
    }

    try {
      const expenseToSave: CreateExpenseDTO = {
        description: fe.description,
        amount,
        category: fe.category,
        accountId: input.accountId !== 'NONE' ? input.accountId : undefined,
        fixedExpenseId: fe.id,
        tagId: fe.tag?.id,
      };
      await addExpense(expenseToSave);
      toast.success(`Pago de "${fe.description}" registrado`);
      loadAll(toYearMonthStr(currentDate));
      loadExpensesList();
    } catch (err) {
      toast.error('Error al registrar el pago');
    }
  };

  const handleRevertFixedExpense = async (fe: MonthlyFixedExpense) => {
    if (!fe.expenseId) return;
    try {
      await deleteExpense(fe.expenseId);
      toast.success(`Pago de "${fe.description}" revertido`);
      loadAll(toYearMonthStr(currentDate));
      loadExpensesList();
    } catch (err) {
      toast.error('Error al revertir el pago');
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await regenerateMonthlyExpenses(toYearMonthStr(currentDate));
      toast.success('Expensas del mes regeneradas con éxito');
      setIsRegenerateDialogOpen(false);
    } catch (err) {
      toast.error('Error al regenerar las expensas');
    } finally {
      setIsRegenerating(false);
    }
  };

  const openBudgetDialog = () => {
    const total = summary?.budgetConfig?.totalAmount ?? summary?.totalBudget ?? 0;
    const vida = summary?.budgetConfig?.vidaPercentage ?? 50;
    const ocio = summary?.budgetConfig?.ocioPercentage ?? 30;
    const inversion = summary?.budgetConfig?.inversionPercentage ?? 20;
    setBudgetTotalAmount(total);
    setBudgetVidaPct(vida);
    setBudgetOcioPct(ocio);
    setBudgetInversionPct(inversion);
    setIsBudgetDialogOpen(true);
  };

  const handleSaveMonthlyBudget = async () => {
    if (budgetVidaPct + budgetOcioPct + budgetInversionPct !== 100) {
      toast.error('La suma de porcentajes debe ser exactamente 100%');
      return;
    }
    if (budgetTotalAmount < 0) {
      toast.error('El monto total debe ser mayor o igual a 0');
      return;
    }
    setIsSavingBudget(true);
    try {
      await updateMonthlyBudget(toYearMonthStr(currentDate), {
        totalAmount: budgetTotalAmount,
        vidaPercentage: budgetVidaPct,
        ocioPercentage: budgetOcioPct,
        inversionPercentage: budgetInversionPct,
      });
      toast.success('Presupuesto del mes actualizado');
      setIsBudgetDialogOpen(false);
    } catch (_err) {
      toast.error('Error al actualizar el presupuesto del mes');
    } finally {
      setIsSavingBudget(false);
    }
  };

  const handleResetBudget = async () => {
    setIsResettingBudget(true);
    try {
      await resetMonthlyBudget(toYearMonthStr(currentDate));
      toast.success('Presupuesto restablecido a la plantilla global');
      setIsBudgetDialogOpen(false);
    } catch (_err) {
      toast.error('Error al restablecer el presupuesto');
    } finally {
      setIsResettingBudget(false);
    }
  };

  const updatePaymentAmount = (feId: string, amount: string) => {
    setPaymentInputs(prev => ({
      ...prev,
      [feId]: { ...prev[feId], amount }
    }));
  };

  const updatePaymentAccount = (feId: string, accountId: string) => {
    setPaymentInputs(prev => ({
      ...prev,
      [feId]: { ...prev[feId], accountId }
    }));
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${day}/${month} ${hours}:${minutes}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <section className={isLoading || !summary || !summary.totalBudget || summary.totalBudget === 0 ? "flex flex-col gap-6" : "lg:grid lg:grid-cols-4 lg:grid-rows-[auto_auto_1fr] lg:gap-4 flex flex-col gap-8 lg:h-full lg:overflow-hidden"}>
      {/* Month Year Selector Carousel */}
      <MonthSelector
        currentDate={currentDate}
        onMonthChange={setCurrentDate}
        className="lg:col-span-4"
        rightSlot={
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={openBudgetDialog}
            className="h-8 text-xs font-medium ml-1 gap-1.5 cursor-pointer"
            title="Configurar presupuesto del mes"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Presupuesto</span>
            {summary?.budgetConfig?.isCustom && (
              <span className="size-1.5 rounded-full bg-primary" />
            )}
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex flex-col gap-6">
          {/* Skeleton Overview Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-border/50 shadow-sm p-4 flex flex-col gap-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-36" />
                <Skeleton className="h-3 w-40" />
              </Card>
            ))}
          </div>

          {/* Skeleton Cosas a Pagar */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-1" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center p-4 border border-border rounded-lg bg-card">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="flex flex-col gap-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : !summary || !summary.totalBudget || summary.totalBudget === 0 ? (
        <Alert className="border-amber-500/25 bg-amber-500/5 text-amber-900 dark:text-amber-200 flex items-start gap-3 p-5 rounded-xl border">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="flex flex-col gap-1">
            <AlertTitle className="text-sm font-bold">Presupuesto no configurado</AlertTitle>
            <AlertDescription className="text-xs opacity-90 font-medium">
              No hay una configuración de presupuesto activa para este período o la base de datos está vacía.
              Por favor, ve a la pestaña de <strong>Configuración</strong> para establecer tu presupuesto global y porcentajes de categoría, o configúralo específicamente para este mes.
            </AlertDescription>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openBudgetDialog}
              className="mt-2 w-fit text-xs font-semibold gap-1.5"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Configurar presupuesto de este mes
            </Button>
          </div>
        </Alert>
      ) : (
        <>
          {/* Dashboard Overview Cards - Mobile (Single Combined Card) */}
          <Card className={`block sm:hidden border-border/50 shadow-sm bg-card ${remainingRealBalance < 0 ? 'border-destructive/30 bg-destructive/5' : ''}`}>
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <CardDescription className="text-[10px] text-muted-foreground uppercase font-semibold">Balance Restante</CardDescription>
                  {summary.budgetConfig?.isCustom ? (
                    <Badge variant="outline" className="text-[9px] py-0 px-1 border-primary/40 text-primary bg-primary/5">
                      Personalizado
                    </Badge>
                  ) : null}
                </div>
                <CardTitle className={`text-xl font-bold ${remainingRealBalance < 0 ? 'text-destructive' : 'text-primary'}`}>
                  ${remainingRealBalance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </CardTitle>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Presupuesto Restante: <strong className={(summary.totalRemaining ?? 0) < 0 ? 'text-destructive' : 'text-foreground'}>${(summary.totalRemaining ?? 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={openBudgetDialog}
                className="h-7 px-2 text-[11px] gap-1 shrink-0"
              >
                <SlidersHorizontal className="h-3 w-3" />
                Presupuesto
              </Button>
            </CardHeader>
            <CardContent className="pt-0 flex flex-col gap-2">
              <div className="h-px bg-border/60 my-0.5" />
              <div className="grid grid-cols-3 gap-2 text-center">
                {categories.map(cat => {
                  const catData = summary.categories?.[cat];
                  if (!catData) return null;
                  const isNegative = (catData.remainingBudget ?? 0) < 0;
                  return (
                    <div key={cat} className="flex flex-col gap-0.5 items-center justify-center p-1.5 rounded bg-muted/30 border border-border/25">
                      <span className="text-[8px] text-muted-foreground font-semibold uppercase">{cat}</span>
                      <span className={`text-xs font-bold ${isNegative ? 'text-destructive' : 'text-foreground/90'}`}>
                        ${(catData.remainingBudget ?? 0).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Overview Cards - Desktop */}
          {/* Total Budget Card */}
          <Card className={`lg:row-start-2 hidden sm:block border-border/50 shadow-sm ${remainingRealBalance < 0 ? 'border-destructive/30 bg-destructive/5' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs text-muted-foreground font-normal">Balance Restante</CardDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openBudgetDialog}
                  className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                  title="Configurar presupuesto del mes"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Presupuesto
                </Button>
              </div>
              <CardTitle className={`text-2xl font-bold ${remainingRealBalance < 0 ? 'text-destructive' : 'text-primary'}`}>
                ${remainingRealBalance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground flex items-center justify-between">
              <div>
                Presupuesto Restante: <strong className={(summary.totalRemaining ?? 0) < 0 ? 'text-destructive' : 'text-foreground'}>${(summary.totalRemaining ?? 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
              {summary.budgetConfig?.isCustom ? (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-primary/40 text-primary bg-primary/5">
                  Personalizado
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-muted-foreground">
                  Plantilla global
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Category Budget Cards */}
          {categories.map(cat => {
            const catData = summary.categories?.[cat];
            if (!catData) return null;
            const isNegative = (catData.remainingBudget ?? 0) < 0;
            return (
              <Card key={cat} className={`lg:row-start-2 hidden sm:block border-border/50 shadow-sm ${isNegative ? 'border-destructive/30 bg-destructive/5' : ''}`}>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs text-muted-foreground font-normal flex items-center justify-between">
                    <span>{cat}</span>
                    <span className={isNegative ? 'text-destructive font-bold' : 'text-muted-foreground font-medium'}>
                      ${(catData.remainingBudget ?? 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })} libres
                    </span>
                  </CardDescription>
                  <div className="flex justify-between items-baseline mt-1 text-sm font-semibold">
                    <span className="text-xs font-normal text-muted-foreground">Gastado: ${getCategorySpent(cat).toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span>
                    <span className="text-xs font-normal text-muted-foreground">Reservado: ${getCategoryReserved(cat).toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <Progress
                    value={getCategoryPercentage(cat)}
                    className="h-2"
                    indicatorClassName={isNegative ? 'bg-destructive' : 'bg-primary'}
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Asignado: ${(catData.assignedBudget ?? 0).toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span>
                    <span>{getCategoryPercentage(cat)}%</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Mobile Selector / Tab Switcher */}
          <div className="lg:hidden flex border border-border rounded-lg p-1 bg-muted/45 gap-1 mt-2">
            <Button
              variant={activeMobileView === 'fixed' ? 'default' : 'ghost'}
              size="sm"
              type="button"
              className="flex-1 text-xs py-1 h-8 font-semibold rounded-md transition-all"
              onClick={() => setActiveMobileView('fixed')}
            >
              Cosas a Pagar
            </Button>
            <Button
              variant={activeMobileView === 'variable' ? 'default' : 'ghost'}
              size="sm"
              type="button"
              className="flex-1 text-xs py-1 h-8 font-semibold rounded-md transition-all"
              onClick={() => setActiveMobileView('variable')}
            >
              Gastos Variables
            </Button>
          </div>

          {/* Columns Grid */}
          {/* Left Column: Cosas a Pagar */}
          <div className={`lg:col-span-2 lg:col-start-1 lg:row-start-3 lg:h-full lg:flex lg:flex-col lg:min-h-0 ${activeMobileView === 'fixed' ? 'flex' : 'hidden'} lg:flex flex-col gap-6 w-full`}>
            <Card className="border-border shadow-sm w-full lg:h-full lg:flex lg:flex-col lg:min-h-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Cosas a Pagar en el Mes
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground font-normal">
                    Controla y marca tus gastos planificados del mes
                  </CardDescription>
                </div>
                {summary?.generated ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => setIsRegenerateDialogOpen(true)}
                    disabled={isRegenerating}
                  >
                    <RotateCcw data-icon="inline-start" className="size-3.5" />
                    Regenerar
                  </Button>
                ) : null}
              </CardHeader>
              <CardContent className="lg:flex-1 lg:min-h-0 lg:flex lg:flex-col">
                <div className="flex flex-col gap-3 lg:flex-1 lg:overflow-y-auto pr-1">
                  {!summary.generated ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground gap-4 border border-dashed rounded-lg border-border bg-muted/20">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <TrendingDown className="h-6 w-6" />
                      </div>
                      <div className="flex flex-col gap-1 max-w-sm">
                        <span className="text-sm font-semibold text-foreground">Expensas no generadas</span>
                        <span className="text-xs text-muted-foreground">
                          Las expensas planificadas para {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })} aún no han sido inicializadas.
                        </span>
                      </div>
                      <Button
                        type="button"
                        onClick={async () => {
                          try {
                            await generateMonthlyExpenses(toYearMonthStr(currentDate));
                            toast.success('Expensas del mes generadas con éxito');
                          } catch (err) {
                            toast.error('Error al generar las expensas');
                          }
                        }}
                        className="mt-1 font-semibold"
                      >
                        Generar expensas del mes
                      </Button>
                    </div>
                  ) : (summary.fixedExpenses ?? []).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground gap-2">
                      <CheckCircle2 className="h-10 w-10 opacity-30 stroke-[1.5] text-emerald-500" />
                      <span className="text-sm font-medium">No hay cosas planificadas a pagar para este mes</span>
                      <span className="text-xs text-muted-foreground">Configúralas en la pestaña de Configuración</span>
                    </div>
                  ) : (
                    (summary.fixedExpenses ?? []).map((fe) => (
                      <div
                        key={fe.id}
                        className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border transition-colors gap-4 ${fe.paid ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-border bg-card'
                          }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="shrink-0 pt-0.5">
                            {fe.paid ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-500/10" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground/60" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0 gap-1.5">
                            {/* Line 1: Title and Category badge */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-foreground">{fe.description}</span>
                              <Badge variant="outline" className={`text-[10px] py-0 px-2 shrink-0 ${fe.category === 'VIDA' ? 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20' :
                                fe.category === 'OCIO' ? 'border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20' :
                                  'border-green-500/30 text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-950/20'
                                }`}>
                                {fe.category}
                              </Badge>
                            </div>

                            {/* Line 2: Tag (Always under name and category) */}
                            {fe.tag && (
                              <div className="flex items-center">
                                <Badge
                                  variant="secondary"
                                  className="gap-1.5 text-[11px] font-normal size-auto px-2 py-0.5 border"
                                  style={fe.tag.color ? {
                                    backgroundColor: `${fe.tag.color}18`,
                                    borderColor: `${fe.tag.color}40`,
                                    color: fe.tag.color,
                                  } : undefined}
                                >
                                  <TagIcon name={fe.tag.icon} className="size-3.5" />
                                  <span>{fe.tag.name}</span>
                                </Badge>
                              </div>
                            )}

                            {/* Line 3: Due date */}
                            <span className="text-[10px] text-muted-foreground">
                              {fe.dueDay ? `Vence el día ${fe.dueDay}` : 'Sin vencimiento'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 justify-end">
                          {fe.paid ? (
                            <div className="flex flex-col sm:items-end items-start gap-2 justify-center w-full md:w-auto">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <div className="text-right text-xs">
                                  <span className="text-muted-foreground mr-1">Pagado:</span>
                                  <strong className="text-foreground font-bold">${fe.actualAmount?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong>
                                </div>
                                <div className="text-xs bg-muted/80 px-2.5 py-1 rounded-md border border-border flex items-center gap-1 font-medium">
                                  <span className="text-[10px] text-muted-foreground">Cuenta:</span>
                                  <strong className="text-foreground">{getAccountName(fe.accountId)}</strong>
                                </div>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-7 text-xs px-2.5 cursor-pointer"
                                onClick={() => handleRevertFixedExpense(fe)}
                              >
                                <Undo2 className="h-3 w-3 mr-1" /> Revertir
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-2 justify-end w-full md:w-auto">
                              <span className="text-xs text-muted-foreground mr-1">Plan: ${fe.amount}</span>
                              <Input
                                type="number"
                                value={paymentInputs[fe.id]?.amount || ''}
                                onChange={(e) => updatePaymentAmount(fe.id, e.target.value)}
                                className="h-8 w-20 text-xs px-2"
                                placeholder="Monto"
                              />
                              <Select
                                value={paymentInputs[fe.id]?.accountId || 'NONE'}
                                onValueChange={(val) => updatePaymentAccount(fe.id, val || 'NONE')}
                              >
                                <SelectTrigger className="h-8 w-28 text-xs">
                                  <SelectValue placeholder="Cuenta">
                                    {(val) => {
                                      if (!val || val === 'NONE') return 'Ninguna';
                                      return accounts.find(a => a.id === val)?.name || 'Ninguna';
                                    }}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="NONE">Ninguna</SelectItem>
                                  {accounts.map(acc => (
                                    <SelectItem key={acc.id} value={acc.id || 'NONE'}>
                                      {acc.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="default"
                                size="sm"
                                className="h-8"
                                onClick={() => handlePayFixedExpense(fe)}
                              >
                                <Check className="h-3.5 w-3.5 mr-1" /> Pagar
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Gastos Variables */}
          <div className={`lg:col-span-2 lg:col-start-3 lg:row-start-3 lg:h-full lg:flex lg:flex-col lg:min-h-0 ${activeMobileView === 'variable' ? 'flex' : 'hidden'} lg:flex flex-col gap-6 w-full`}>
            {/* Historial de Movimientos */}
            <Card className="border-border shadow-sm lg:h-full lg:flex lg:flex-col lg:min-h-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  Historial de Movimientos
                </CardTitle>
                <Button
                  onClick={() => setIsCreateExpensesOpen(true)}
                  size="sm"
                  className="font-medium h-9"
                >
                  <Plus data-icon="inline-start" className="size-4" />
                  Nuevo Gasto
                </Button>
              </CardHeader>
              <CardContent className="lg:flex-1 lg:min-h-0 lg:flex lg:flex-col gap-4 flex flex-col lg:overflow-hidden">
                {/* Filters Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-muted/40 p-4 rounded-lg border border-border/50 shrink-0">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase">Categoría</label>
                    <Select value={filterCategory} onValueChange={(val) => { setFilterCategory(val || 'ALL'); setPageIndex(0); }}>
                      <SelectTrigger className="h-9 bg-card">
                        <SelectValue placeholder="Categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Todas</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase">Cuenta</label>
                    <Select value={filterAccount} onValueChange={(val) => { setFilterAccount(val || 'ALL'); setPageIndex(0); }}>
                      <SelectTrigger className="h-9 bg-card">
                        <SelectValue placeholder="Cuenta">
                          {(val) => {
                            if (!val || val === 'ALL') return 'Todas';
                            return accounts.find(a => a.id === val)?.name || 'Todas';
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Todas</SelectItem>
                        {accounts.map(acc => (
                          <SelectItem key={acc.id} value={acc.id || 'NONE'}>
                            {acc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase">Desde</label>
                    <Input
                      type="date"
                      value={filterDateFrom}
                      onChange={(e) => { setFilterDateFrom(e.target.value); setPageIndex(0); }}
                      className="h-9 bg-card text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase">Hasta</label>
                    <Input
                      type="date"
                      value={filterDateTo}
                      onChange={(e) => { setFilterDateTo(e.target.value); setPageIndex(0); }}
                      className="h-9 bg-card text-xs"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="rounded-md border border-border lg:flex-1 lg:min-h-0 lg:overflow-y-auto pr-1 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="w-32">Clasificación</TableHead>
                        <TableHead className="w-28">Cuenta</TableHead>
                        <TableHead className="w-28 text-right">Monto</TableHead>
                        <TableHead className="w-16 text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="overflow-y-auto">
                      {expenses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <SearchX className="h-8 w-8 stroke-[1.5] opacity-40" />
                              <span className="text-sm">No se encontraron movimientos registrados</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        expenses.map((row) => (
                          <TableRow
                            key={row.id}
                            className={cn(
                              "transition-colors",
                              row.fixedExpenseId
                                ? "bg-primary/[0.04] hover:bg-primary/[0.08] dark:bg-primary/[0.07] dark:hover:bg-primary/[0.12] border-l-2 border-l-primary/70"
                                : "hover:bg-muted/40"
                            )}
                            title={row.fixedExpenseId ? "Gasto planificado (fijo)" : undefined}
                          >
                            <TableCell className="py-3.5 px-3">
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="font-semibold text-sm text-foreground truncate" title={row.description}>
                                  {row.description}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                  {formatDate(row.createdAt)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3.5 px-3">
                              <div className="flex flex-col gap-1.5 items-start">
                                <Badge variant="outline" className={`text-[10px] py-0 px-2 font-normal shrink-0 ${row.category === 'VIDA' ? 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20' :
                                  row.category === 'OCIO' ? 'border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20' :
                                    'border-green-500/30 text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-950/20'
                                  }`}>
                                  {row.category}
                                </Badge>
                                {row.tag && (
                                  <Badge
                                    variant="secondary"
                                    className="gap-1 text-[10px] font-normal size-auto px-1.5 py-0.5 shrink-0"
                                    style={row.tag.color ? {
                                      backgroundColor: `${row.tag.color}18`,
                                      borderColor: `${row.tag.color}35`,
                                      color: row.tag.color,
                                    } : undefined}
                                  >
                                    <TagIcon name={row.tag.icon} className="size-3" />
                                    <span className="truncate max-w-[85px]">{row.tag.name}</span>
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-3.5 px-3 text-xs">
                              {row.accountId ? (
                                <span className="bg-muted px-2 py-0.5 rounded border border-border font-medium text-foreground/80 truncate block max-w-[105px]" title={getAccountName(row.accountId)}>
                                  {getAccountName(row.accountId)}
                                </span>
                              ) : (
                                <span className="text-muted-foreground/50 font-normal">-</span>
                              )}
                            </TableCell>
                            <TableCell className="py-3.5 px-3 text-right font-bold text-sm">
                              ${row.amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="py-3.5 px-2">
                              <div className="flex items-center gap-0.5 justify-end">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:text-primary text-muted-foreground/75 cursor-pointer"
                                  onClick={() => {
                                    setSelectedExpenseForEdit(row);
                                    setIsEditExpenseOpen(true);
                                  }}
                                  title="Editar gasto"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:text-destructive text-muted-foreground/75 cursor-pointer"
                                  onClick={() => handleDeleteExpense(row.id)}
                                  title="Eliminar gasto"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-sm text-muted-foreground lg:shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">Items por página</span>
                    <Select value={pageSize.toString()} onValueChange={(val) => { setPageSize(parseInt(val || '10')); setPageIndex(0); }}>
                      <SelectTrigger className="h-8 w-16 bg-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['5', '10', '25', '50'].map(size => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground/60 ml-2">Total: {totalItems} items</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPageIndex(prev => Math.max(0, prev - 1))}
                      disabled={pageIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span>Página {pageIndex + 1}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPageIndex(prev => prev + 1)}
                      disabled={(pageIndex + 1) * pageSize >= totalItems}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Dialogo de Confirmación para Regenerar Expensas */}
      <Dialog open={isRegenerateDialogOpen} onOpenChange={setIsRegenerateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="size-5 text-destructive" />
              ¿Regenerar expensas del mes?
            </DialogTitle>
            <DialogDescription className="text-sm pt-2 text-muted-foreground">
              Esta acción volverá a crear las expensas fijas del mes a partir de las plantillas actuales de configuración.
              <br /><br />
              <strong className="text-foreground font-semibold">Importante:</strong> Todos los pagos marcados en este mes serán eliminados y los saldos de las cuentas asociadas serán restaurados automáticamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsRegenerateDialogOpen(false)}
              disabled={isRegenerating}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              type="button"
              onClick={handleRegenerate}
              disabled={isRegenerating}
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="animate-spin" data-icon="inline-start" />
                  Regenerando...
                </>
              ) : (
                <>
                  <RotateCcw data-icon="inline-start" />
                  Confirmar y Regenerar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogo de Configuración de Presupuesto del Mes */}
      <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <SlidersHorizontal className="size-4 text-primary" />
                Presupuesto de {formatMonthDisplay(currentDate)}
              </DialogTitle>
              {summary?.budgetConfig?.isCustom ? (
                <Badge variant="outline" className="text-[10px] font-normal border-primary/40 text-primary bg-primary/5">
                  Personalizado
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
                  Plantilla global
                </Badge>
              )}
            </div>
            <DialogDescription className="text-xs">
              Ajusta el monto total y los porcentajes asignados específicamente para este mes.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {/* Presupuesto Total */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="month-budget-total" className="text-xs font-semibold text-foreground">
                Presupuesto Total Mensual ($)
              </label>
              <Input
                id="month-budget-total"
                type="number"
                min="0"
                step="0.01"
                value={budgetTotalAmount || ''}
                onChange={(e) => setBudgetTotalAmount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="h-9"
              />
            </div>

            {/* Categorías (3 columnas) */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* VIDA */}
              <div className="flex flex-col gap-1.5 p-3 rounded-lg border border-border/80 bg-muted/20">
                <span className="text-[11px] font-semibold text-muted-foreground">% Vida</span>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={budgetVidaPct || ''}
                  onChange={(e) => setBudgetVidaPct(parseInt(e.target.value) || 0)}
                  className="h-8 text-xs"
                />
                <div className="flex flex-col gap-0.5 pt-1 text-[11px] text-muted-foreground">
                  <span>Asignado:</span>
                  <span className="font-semibold text-foreground">
                    ${((budgetTotalAmount * budgetVidaPct) / 100).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* OCIO */}
              <div className="flex flex-col gap-1.5 p-3 rounded-lg border border-border/80 bg-muted/20">
                <span className="text-[11px] font-semibold text-muted-foreground">% Ocio</span>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={budgetOcioPct || ''}
                  onChange={(e) => setBudgetOcioPct(parseInt(e.target.value) || 0)}
                  className="h-8 text-xs"
                />
                <div className="flex flex-col gap-0.5 pt-1 text-[11px] text-muted-foreground">
                  <span>Asignado:</span>
                  <span className="font-semibold text-foreground">
                    ${((budgetTotalAmount * budgetOcioPct) / 100).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* INVERSION */}
              <div className="flex flex-col gap-1.5 p-3 rounded-lg border border-border/80 bg-muted/20">
                <span className="text-[11px] font-semibold text-muted-foreground">% Inversión</span>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={budgetInversionPct || ''}
                  onChange={(e) => setBudgetInversionPct(parseInt(e.target.value) || 0)}
                  className="h-8 text-xs"
                />
                <div className="flex flex-col gap-0.5 pt-1 text-[11px] text-muted-foreground">
                  <span>Asignado:</span>
                  <span className="font-semibold text-foreground">
                    ${((budgetTotalAmount * budgetInversionPct) / 100).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Error si no suma 100 */}
            {budgetVidaPct + budgetOcioPct + budgetInversionPct !== 100 && (
              <Alert variant="destructive" className="py-2 px-3 text-xs flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <div>
                  La suma de porcentajes debe ser exactamente 100% (actual: <strong>{budgetVidaPct + budgetOcioPct + budgetInversionPct}%</strong>)
                </div>
              </Alert>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2 pt-2">
            {summary?.budgetConfig?.isCustom ? (
              <Button
                variant="ghost"
                type="button"
                onClick={handleResetBudget}
                disabled={isSavingBudget || isResettingBudget}
                className="text-xs text-muted-foreground hover:text-destructive order-last sm:order-first px-2"
              >
                <RotateCcw className="size-3.5 mr-1" data-icon="inline-start" />
                Restablecer a plantilla global
              </Button>
            ) : <div />}

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsBudgetDialogOpen(false)}
                disabled={isSavingBudget || isResettingBudget}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSaveMonthlyBudget}
                disabled={
                  isSavingBudget ||
                  isResettingBudget ||
                  budgetTotalAmount < 0 ||
                  budgetVidaPct + budgetOcioPct + budgetInversionPct !== 100
                }
              >
                {isSavingBudget ? (
                  <>
                    <Loader2 className="animate-spin" data-icon="inline-start" />
                    Guardando...
                  </>
                ) : (
                  'Guardar para este mes'
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogo para crear nuevos gastos en lista */}
      <CreateExpensesDialog
        open={isCreateExpensesOpen}
        onOpenChange={setIsCreateExpensesOpen}
        onSuccess={() => {
          loadAll(toYearMonthStr(currentDate));
          loadExpensesList();
        }}
      />

      {/* Dialogo para actualizar un gasto */}
      <UpdateExpenseDialog
        expense={selectedExpenseForEdit}
        open={isEditExpenseOpen}
        onOpenChange={setIsEditExpenseOpen}
        onSuccess={() => {
          loadAll(toYearMonthStr(currentDate));
          loadExpensesList();
          setSelectedExpenseForEdit(null);
        }}
      />
    </section>
  );
};
