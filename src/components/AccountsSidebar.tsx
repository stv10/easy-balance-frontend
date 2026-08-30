import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import type { Account } from '../types/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, PiggyBank, CreditCard } from 'lucide-react';

export const AccountsSidebar: React.FC = () => {
  const { accounts, addAccount, updateAccount, deleteAccount, loadAll } = useApi();
  const [newName, setNewName] = useState('');
  const [newBalance, setNewBalance] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);

  // Edit balance state
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editBalanceValue, setEditBalanceValue] = useState<string>('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    const balance = parseFloat(newBalance) || 0;
    if (!name) return;

    setIsAdding(true);
    try {
      await addAccount({ name, balance });
      setNewName('');
      setNewBalance('');
      toast.success('Cuenta bancaria agregada con éxito');
      loadAll();
    } catch (err) {
      toast.error('Error al agregar cuenta');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la cuenta "${name}"?`)) return;
    try {
      await deleteAccount(id);
      toast.success('Cuenta eliminada con éxito');
      loadAll();
    } catch (err) {
      toast.error('Error al eliminar la cuenta');
    }
  };

  const openEditDialog = (account: Account) => {
    setEditingAccount(account);
    setEditBalanceValue(account.balance.toString());
  };

  const handleSaveEdit = async () => {
    if (!editingAccount || !editingAccount.id) return;
    const balance = parseFloat(editBalanceValue);
    if (isNaN(balance)) {
      toast.error('Por favor ingrese un saldo válido');
      return;
    }

    setIsSavingEdit(true);
    try {
      await updateAccount(editingAccount.id, {
        ...editingAccount,
        balance,
      });
      toast.success('Saldo actualizado con éxito');
      setEditingAccount(null);
      loadAll();
    } catch (err) {
      toast.error('Error al actualizar el saldo');
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-primary" />
            Cuentas Bancarias
          </CardTitle>
          <div className={`text-right ${totalBalance < 0 ? 'text-destructive' : 'text-primary'}`}>
            <div className="text-xs text-muted-foreground font-normal">Balance Total</div>
            <div className="text-xl font-bold">${totalBalance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
            {accounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground gap-2">
                <CreditCard className="h-8 w-8 opacity-40 stroke-[1.5]" />
                <span className="text-sm">No hay cuentas cargadas</span>
              </div>
            ) : (
              accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-semibold truncate text-foreground">{acc.name}</span>
                    <span className={`text-sm font-medium ${acc.balance < 0 ? 'text-destructive font-bold' : 'text-muted-foreground text-foreground/80'}`}>
                      ${acc.balance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-primary rounded-md"
                      onClick={() => openEditDialog(acc)}
                      title="Editar saldo"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-destructive rounded-md"
                      onClick={() => acc.id && handleDelete(acc.id, acc.name)}
                      title="Eliminar cuenta"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <Separator className="bg-border/50" />

          {/* Form to add account */}
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <div className="text-sm font-medium text-foreground">Agregar Nueva Cuenta</div>
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Nombre de la cuenta"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="h-9"
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Saldo inicial ($)"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="h-9"
                />
                <Button type="submit" disabled={!newName.trim() || isAdding} className="h-9 shrink-0">
                  <Plus className="h-4 w-4 mr-1" /> Agregar
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Edit balance Dialog */}
      <Dialog open={editingAccount !== null} onOpenChange={(open) => !open && setEditingAccount(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Saldo</DialogTitle>
            <DialogDescription>
              Modifica el saldo actual de la cuenta <strong>{editingAccount?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="balance-input" className="text-sm font-medium">Saldo ($)</label>
              <Input
                id="balance-input"
                type="number"
                step="0.01"
                value={editBalanceValue}
                onChange={(e) => setEditBalanceValue(e.target.value)}
                className="col-span-3"
                placeholder="0.00"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAccount(null)}>Cancelar</Button>
            <Button onClick={handleSaveEdit} disabled={isSavingEdit}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
