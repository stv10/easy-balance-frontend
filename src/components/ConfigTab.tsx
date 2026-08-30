import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import type { BudgetConfig, FixedExpense } from '../types/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Settings,
  Receipt,
  Save,
  Plus,
  Trash2,
  Pencil,
  ListCollapse,
  AlertCircle
} from 'lucide-react';

export const ConfigTab: React.FC = () => {
  const {
    getConfig,
    updateConfig,
    getFixedExpenses: fetchFixedExpenses,
    addFixedExpense,
    updateFixedExpense,
    deleteFixedExpense,
    loadSummary,
  } = useApi();

  // Global Budget configuration states
  const [configId, setConfigId] = useState<string | undefined>(undefined);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [vidaPercentage, setVidaPercentage] = useState<number>(50);
  const [ocioPercentage, setOcioPercentage] = useState<number>(30);
  const [inversionPercentage, setInversionPercentage] = useState<number>(20);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Template Fixed Expenses states
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [newDescription, setNewDescription] = useState('');
  const [newAmount, setNewAmount] = useState<string>('');
  const [newCategory, setNewCategory] = useState('VIDA');
  const [newDueDay, setNewDueDay] = useState<string>('');
  const [isAddingFixed, setIsAddingFixed] = useState(false);

  // Edit Fixed Expense states
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState<string>('');
  const [editCategory, setEditCategory] = useState('VIDA');
  const [editDueDay, setEditDueDay] = useState<string>('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const categories = ['VIDA', 'OCIO', 'INVERSION'];
  const percentageSum = vidaPercentage + ocioPercentage + inversionPercentage;
  const isPercentageInvalid = percentageSum !== 100;

  // Load config & fixed expenses on mount
  const loadConfigData = async () => {
    try {
      const c = await getConfig();
      if (c) {
        setConfigId(c.id);
        setTotalAmount(c.totalAmount || 0);
        setVidaPercentage(c.vidaPercentage || 0);
        setOcioPercentage(c.ocioPercentage || 0);
        setInversionPercentage(c.inversionPercentage || 0);
      }
    } catch (err) {
      console.error('Error loading config:', err);
    }
  };

  const loadFixedExpensesData = async () => {
    try {
      const fe = await fetchFixedExpenses();
      setFixedExpenses(fe);
    } catch (err) {
      console.error('Error loading fixed expenses:', err);
    }
  };

  useEffect(() => {
    loadConfigData();
    loadFixedExpensesData();
  }, []);

  // Save budget configuration
  const handleSaveConfig = async () => {
    if (isPercentageInvalid) {
      toast.error('La suma de porcentajes debe ser exactamente 100%');
      return;
    }

    setIsSavingConfig(true);
    try {
      const configToSave: BudgetConfig = {
        id: configId,
        totalAmount,
        vidaPercentage,
        ocioPercentage,
        inversionPercentage,
      };

      const c = await updateConfig(configToSave);
      if (c) {
        setConfigId(c.id);
        setTotalAmount(c.totalAmount || 0);
        setVidaPercentage(c.vidaPercentage || 0);
        setOcioPercentage(c.ocioPercentage || 0);
        setInversionPercentage(c.inversionPercentage || 0);
      }
      toast.success('Configuración de presupuesto guardada');
      loadSummary();
    } catch (err) {
      toast.error('Error al guardar la configuración');
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Add fixed expense template
  const handleAddFixedExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const description = newDescription.trim();
    const amount = parseFloat(newAmount);
    const dueDay = newDueDay ? parseInt(newDueDay) : undefined;

    if (!description || isNaN(amount) || amount <= 0) return;
    if (dueDay !== undefined && (dueDay < 1 || dueDay > 31)) {
      toast.error('El día de vencimiento debe estar entre 1 y 31');
      return;
    }

    setIsAddingFixed(true);
    try {
      await addFixedExpense({
        description,
        amount,
        category: newCategory,
        dueDay
      });
      toast.success('Gasto fijo agregado a la plantilla');
      setNewDescription('');
      setNewAmount('');
      setNewCategory('VIDA');
      setNewDueDay('');
      loadFixedExpensesData();
      loadSummary();
    } catch (err) {
      toast.error('Error al agregar el gasto fijo');
    } finally {
      setIsAddingFixed(false);
    }
  };

  // Delete fixed expense template
  const handleDeleteFixedExpense = async (id?: string) => {
    if (!id) return;
    if (!confirm('¿Estás seguro de que deseas eliminar este gasto fijo?')) return;
    try {
      await deleteFixedExpense(id);
      toast.success('Gasto fijo eliminado de la plantilla');
      loadFixedExpensesData();
      loadSummary();
    } catch (err) {
      toast.error('Error al eliminar el gasto fijo');
    }
  };

  const openEditDialog = (expense: FixedExpense) => {
    setEditingExpense(expense);
    setEditDescription(expense.description);
    setEditAmount(expense.amount.toString());
    setEditCategory(expense.category);
    setEditDueDay(expense.dueDay ? expense.dueDay.toString() : '');
  };

  const handleSaveEdit = async () => {
    if (!editingExpense || !editingExpense.id) return;

    const description = editDescription.trim();
    const amount = parseFloat(editAmount);
    const dueDay = editDueDay ? parseInt(editDueDay) : undefined;

    if (!description || isNaN(amount) || amount <= 0) {
      toast.error('Ingrese una descripción y un monto válido');
      return;
    }
    if (dueDay !== undefined && (dueDay < 1 || dueDay > 31)) {
      toast.error('El día de vencimiento debe estar entre 1 y 31');
      return;
    }

    setIsSavingEdit(true);
    try {
      await updateFixedExpense(editingExpense.id, {
        id: editingExpense.id,
        description,
        amount,
        category: editCategory,
        dueDay
      });
      toast.success('Gasto fijo actualizado');
      setEditingExpense(null);
      loadFixedExpensesData();
      loadSummary();
    } catch (err) {
      toast.error('Error al actualizar el gasto fijo');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Budget helpers
  const getCategoryBudget = (percentage: number): number => {
    return (totalAmount || 0) * (percentage || 0) / 100;
  };

  const getCategoryFixedTotal = (category: string): number => {
    return fixedExpenses
      .filter(fe => fe.category === category)
      .reduce((sum, fe) => sum + fe.amount, 0);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Presupuesto Global Card */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Configuración de Presupuesto
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-start">
            <div className="flex flex-col gap-1.5 lg:w-64 shrink-0">
              <label htmlFor="total-amount" className="text-sm font-medium">Presupuesto Total Mensual ($)</label>
              <Input
                id="total-amount"
                type="number"
                value={totalAmount || ''}
                onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
                className="h-10"
                placeholder="0.00"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3 flex-1">
              {/* Vida column */}
              <div className="flex flex-col gap-2 p-4 rounded-lg border border-border/80 bg-muted/20">
                <label htmlFor="pct-vida" className="text-xs font-semibold text-muted-foreground">% Vida (Fijo/Necesidades)</label>
                <Input
                  id="pct-vida"
                  type="number"
                  min="0"
                  max="100"
                  value={vidaPercentage || ''}
                  onChange={(e) => setVidaPercentage(parseInt(e.target.value) || 0)}
                  className="h-9"
                />
                <div className="flex flex-col gap-1 text-xs pt-1 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Asignado:</span>
                    <span className="font-bold text-foreground">
                      ${getCategoryBudget(vidaPercentage).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gastos Fijos:</span>
                    <span className="font-medium text-foreground">
                      ${getCategoryFixedTotal('VIDA').toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ocio column */}
              <div className="flex flex-col gap-2 p-4 rounded-lg border border-border/80 bg-muted/20">
                <label htmlFor="pct-ocio" className="text-xs font-semibold text-muted-foreground">% Ocio (Variable/Deseos)</label>
                <Input
                  id="pct-ocio"
                  type="number"
                  min="0"
                  max="100"
                  value={ocioPercentage || ''}
                  onChange={(e) => setOcioPercentage(parseInt(e.target.value) || 0)}
                  className="h-9"
                />
                <div className="flex flex-col gap-1 text-xs pt-1 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Asignado:</span>
                    <span className="font-bold text-foreground">
                      ${getCategoryBudget(ocioPercentage).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gastos Fijos:</span>
                    <span className="font-medium text-foreground">
                      ${getCategoryFixedTotal('OCIO').toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inversion column */}
              <div className="flex flex-col gap-2 p-4 rounded-lg border border-border/80 bg-muted/20">
                <label htmlFor="pct-inversion" className="text-xs font-semibold text-muted-foreground">% Inversión (Ahorro)</label>
                <Input
                  id="pct-inversion"
                  type="number"
                  min="0"
                  max="100"
                  value={inversionPercentage || ''}
                  onChange={(e) => setInversionPercentage(parseInt(e.target.value) || 0)}
                  className="h-9"
                />
                <div className="flex flex-col gap-1 text-xs pt-1 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Asignado:</span>
                    <span className="font-bold text-foreground">
                      ${getCategoryBudget(inversionPercentage).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gastos Fijos:</span>
                    <span className="font-medium text-foreground">
                      ${getCategoryFixedTotal('INVERSION').toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Warning block if percentages don't equal 100% */}
          {isPercentageInvalid && (
            <Alert variant="destructive" className="bg-destructive/5 text-destructive border-destructive/20 mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Porcentajes Inválidos</AlertTitle>
              <AlertDescription className="text-xs">
                La suma de porcentajes debe ser exactamente 100%. (Suma actual: <strong>{percentageSum}%</strong>)
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSaveConfig}
              disabled={isPercentageInvalid || isSavingConfig}
              className="h-10 px-4"
            >
              <Save className="h-4 w-4 mr-1.5" /> Guardar Configuración
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gastos Fijos / Plantilla Mensual Card */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Cosas a Pagar en el Mes (Gastos Fijos)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">

          {/* Add form */}
          <form onSubmit={handleAddFixedExpense} className="flex flex-col md:flex-row gap-3">
            <div className="flex-[2] min-w-[200px]">
              <Input
                placeholder="Descripción (ej. Alquiler, Internet)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                required
                className="h-9"
              />
            </div>
            <div className="flex-1 min-w-[100px]">
              <Input
                type="number"
                step="0.01"
                placeholder="Monto ($)"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                required
                className="h-9"
              />
            </div>
            <div className="w-full md:w-36">
              <Select value={newCategory} onValueChange={(val) => setNewCategory(val || 'VIDA')}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-32">
              <Input
                type="number"
                min="1"
                max="31"
                placeholder="Día Venc."
                value={newDueDay}
                onChange={(e) => setNewDueDay(e.target.value)}
                className="h-9"
              />
            </div>
            <Button
              type="submit"
              disabled={!newDescription.trim() || !newAmount || parseFloat(newAmount) <= 0 || isAddingFixed}
              className="h-9 shrink-0"
            >
              <Plus className="h-4 w-4 mr-1" /> Agregar
            </Button>
          </form>

          {/* Table */}
          <div className="rounded-md border border-border overflow-auto max-h-[290px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="w-28">Categoría</TableHead>
                  <TableHead className="w-40 text-right">Monto Presupuestado</TableHead>
                  <TableHead className="w-44">Vencimiento</TableHead>
                  <TableHead className="w-24 text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fixedExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <ListCollapse className="h-8 w-8 stroke-[1.5] opacity-40" />
                        <span className="text-sm">No hay gastos fijos registrados en la plantilla</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  fixedExpenses.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium text-sm">{row.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] py-0 px-2 font-normal ${row.category === 'VIDA' ? 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20' :
                          row.category === 'OCIO' ? 'border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20' :
                            'border-green-500/30 text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-950/20'
                          }`}>
                          {row.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-sm">
                        ${row.amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {row.dueDay ? `Día ${row.dueDay} del mes` : 'Sin vencimiento'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            className="h-8 w-8 hover:text-primary text-muted-foreground/75"
                            onClick={() => openEditDialog(row)}
                            title="Editar de la plantilla"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            className="h-8 w-8 hover:text-destructive text-muted-foreground/75"
                            onClick={() => handleDeleteFixedExpense(row.id)}
                            title="Eliminar de la plantilla"
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
        </CardContent>
      </Card>

      {/* Edit Fixed Expense Dialog */}
      <Dialog open={editingExpense !== null} onOpenChange={(open) => !open && setEditingExpense(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Gasto Fijo</DialogTitle>
            <DialogDescription>
              Modifica la plantilla del gasto fijo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-desc" className="text-sm font-medium">Descripción</label>
              <Input
                id="edit-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Ej. Alquiler, Internet"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-amount" className="text-sm font-medium">Monto ($)</label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Categoría</label>
              <Select value={editCategory} onValueChange={(val) => setEditCategory(val || 'VIDA')}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-due" className="text-sm font-medium">Día de Vencimiento (1-31, Opcional)</label>
              <Input
                id="edit-due"
                type="number"
                min="1"
                max="31"
                value={editDueDay}
                onChange={(e) => setEditDueDay(e.target.value)}
                placeholder="Sin vencimiento"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingExpense(null)}>Cancelar</Button>
            <Button onClick={handleSaveEdit} disabled={!editDescription.trim() || !editAmount || parseFloat(editAmount) <= 0 || isSavingEdit}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
