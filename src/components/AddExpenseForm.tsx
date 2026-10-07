import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import type { Expense, Tag } from '../types/api';
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
import { TagSelect } from '@/components/ui/TagSelect';
import { toast } from 'sonner';
import { Plus, ShoppingCart } from 'lucide-react';

interface AddExpenseFormProps {
  onExpenseAdded?: () => void;
}

export const AddExpenseForm: React.FC<AddExpenseFormProps> = ({ onExpenseAdded }) => {
  const { accounts, addExpense, loadAll } = useApi();

  const [newDescription, setNewDescription] = useState('');
  const [newAmount, setNewAmount] = useState<string>('');
  const [newCategory, setNewCategory] = useState('VIDA');
  const [newAccountId, setNewAccountId] = useState<string>('NONE');
  const [newTagId, setNewTagId] = useState<string | undefined>(undefined);
  const [newTag, setNewTag] = useState<Tag | undefined>(undefined);
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  const categories = ['VIDA', 'OCIO', 'INVERSION'];

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const description = newDescription.trim();
    const amount = parseFloat(newAmount);
    if (!description || isNaN(amount) || amount <= 0) return;

    setIsAddingExpense(true);
    try {
      const expenseToSave: Expense = {
        description,
        amount,
        category: newCategory,
        accountId: newAccountId !== 'NONE' ? newAccountId : undefined,
        tag: newTag,
        tagId: newTagId,
      };

      await addExpense(expenseToSave);
      toast.success('Gasto registrado con éxito');
      setNewDescription('');
      setNewAmount('');
      setNewAccountId('NONE');
      setNewTagId(undefined);
      setNewTag(undefined);
      loadAll();
      onExpenseAdded?.();
    } catch (err) {
      toast.error('Error al registrar el gasto');
    } finally {
      setIsAddingExpense(false);
    }
  };

  return (
    <Card className="border-border shadow-sm w-full shrink-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Registrar Nuevo Gasto Variable
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddExpense} className="flex flex-col gap-3">
          <div>
            <Input
              placeholder="Descripción (ej. Supermercado, Almuerzo)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              required
              className="h-9"
            />
          </div>
          <div>
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
          <div className="flex gap-2">
            <div className="flex-1">
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
            <div className="flex-1">
              <Select value={newAccountId} onValueChange={(val) => setNewAccountId(val || 'NONE')}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Cuenta (Opcional)">
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
            </div>
            <div>
              <TagSelect
                value={newTagId}
                onChange={(id, tag) => {
                  setNewTagId(id);
                  setNewTag(tag);
                }}
              />
            </div>
            <Button
              type="submit"
              disabled={!newDescription.trim() || !newAmount || parseFloat(newAmount) <= 0 || isAddingExpense}
              className="h-9 font-semibold"
            >
              <Plus data-icon="inline-start" /> Cargar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
