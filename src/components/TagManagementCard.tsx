import React, { useState } from 'react';
import { useApi } from '@/context/ApiContext';
import type { Tag } from '@/types/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TagIcon } from '@/components/ui/TagIcon';
import { IconPickerPopover } from '@/components/ui/IconPickerPopover';
import { ColorPickerPopover } from '@/components/ui/ColorPickerPopover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { DEFAULT_TAG_ICON_NAME, getDefaultColorForIcon } from '@/lib/tag-icons';
import { Tag as TagLucide, Plus, Pencil, Trash2, Tags } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TagManagementCardProps {
  className?: string;
}

export const TagManagementCard: React.FC<TagManagementCardProps> = ({ className }) => {
  const { tags, createTag, updateTag, deleteTag } = useApi();

  // Create Tag state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState(DEFAULT_TAG_ICON_NAME);
  const [isCreating, setIsCreating] = useState(false);

  // Edit Tag state
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState(DEFAULT_TAG_ICON_NAME);
  const [editColor, setEditColor] = useState('#3B82F6');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Tag state
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;

    setIsCreating(true);
    try {
      const defaultColor = getDefaultColorForIcon(newIcon);
      await createTag({ name, icon: newIcon, color: defaultColor });
      toast.success(`Etiqueta "${name}" creada`);
      setNewName('');
      setNewIcon(DEFAULT_TAG_ICON_NAME);
      setIsCreateOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Error al crear la etiqueta');
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartEdit = (tag: Tag) => {
    setEditingTag(tag);
    setEditName(tag.name);
    setEditIcon(tag.icon || DEFAULT_TAG_ICON_NAME);
    setEditColor(tag.color || getDefaultColorForIcon(tag.icon));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag) return;
    const name = editName.trim();
    if (!name) return;

    setIsUpdating(true);
    try {
      await updateTag(editingTag.id, { name, icon: editIcon, color: editColor });
      toast.success(`Etiqueta actualizada`);
      setEditingTag(null);
    } catch (err: any) {
      toast.error(err?.message || 'Error al actualizar la etiqueta');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTag) return;
    setIsDeleting(true);
    try {
      await deleteTag(deletingTag.id);
      toast.success(`Etiqueta "${deletingTag.name}" eliminada`);
      setDeletingTag(null);
    } catch (err: any) {
      toast.error(err?.message || 'Error al eliminar la etiqueta');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className={cn('border-border shadow-sm flex flex-col h-full min-h-0', className)}>
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 shrink-0">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Tags className="size-4 text-primary" />
            Gestión de Etiquetas
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCreateOpen(true)}
            className="h-8 text-xs px-2.5"
          >
            <Plus data-icon="inline-start" /> Nueva
          </Button>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-2">
          {tags.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-center text-muted-foreground gap-2 p-4">
              <TagLucide className="size-8 opacity-30 stroke-[1.5]" />
              <p className="text-xs">No hay etiquetas registradas.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateOpen(true)}
                className="h-7 text-xs mt-1"
              >
                Crear primera etiqueta
              </Button>
            </div>
          ) : (
            tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-2 rounded-lg border border-border/70 bg-card hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div
                    className="size-7 rounded-md border flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${tag.color || '#3b82f6'}1a`,
                      borderColor: `${tag.color || '#3b82f6'}40`,
                      color: tag.color || '#3b82f6',
                    }}
                  >
                    <TagIcon name={tag.icon} className="size-3.5" />
                  </div>
                  <span className="font-medium text-xs text-foreground truncate" title={tag.name}>
                    {tag.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-foreground"
                    onClick={() => handleStartEdit(tag)}
                    title="Editar etiqueta"
                  >
                    <Pencil className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeletingTag(tag)}
                    title="Eliminar etiqueta"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Dialog Nueva Etiqueta */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-1.5">
              <Plus className="size-4 text-primary" />
              Nueva Etiqueta
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Asigna un nombre e icono para categorizar tus gastos.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-3 py-2">
            <div className="flex items-center gap-2">
              <IconPickerPopover
                value={newIcon}
                onChange={setNewIcon}
                className="size-9"
              />
              <Input
                placeholder="Nombre de la etiqueta"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="h-9 text-xs flex-1"
                autoFocus
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateOpen(false)}
                className="h-8 text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!newName.trim() || isCreating}
                className="h-8 text-xs"
              >
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Etiqueta */}
      <Dialog open={!!editingTag} onOpenChange={(open) => !open && setEditingTag(null)}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-1.5">
              <Pencil className="size-4 text-primary" />
              Editar Etiqueta
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Modifica el nombre o icono de la etiqueta.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="flex flex-col gap-3 py-2">
            <div className="flex items-center gap-2">
              <IconPickerPopover
                value={editIcon}
                onChange={setEditIcon}
                className="size-9 shrink-0"
              />
              <ColorPickerPopover
                color={editColor}
                onChange={setEditColor}
              />
            </div>
            <Input
              placeholder="Nombre de la etiqueta"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
              className="h-9 text-xs"
              autoFocus
            />
            <DialogFooter className="gap-2 sm:gap-0 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingTag(null)}
                className="h-8 text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!editName.trim() || isUpdating}
                className="h-8 text-xs"
              >
                Actualizar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmar Eliminación */}
      <Dialog open={!!deletingTag} onOpenChange={(open) => !open && setDeletingTag(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-destructive flex items-center gap-1.5">
              <Trash2 className="size-4" />
              ¿Eliminar etiqueta "{deletingTag?.name}"?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Esta etiqueta será desvinculada de todos los gastos y plantillas asociadas. Ningún gasto será eliminado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeletingTag(null)}
              className="h-8 text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={handleDelete}
              className="h-8 text-xs"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
