import React, { useState, useMemo } from 'react';
import { useApi } from '@/context/ApiContext';
import type { Tag } from '@/types/api';
import { TagIcon } from './TagIcon';
import { IconPickerPopover } from './IconPickerPopover';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from './popover';
import { Button } from './button';
import { Input } from './input';
import { cn } from '@/lib/utils';
import { Search, Plus, Check, ChevronsUpDown, X } from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_TAG_ICON_NAME } from '@/lib/tag-icons';

interface TagSelectProps {
  value?: string;
  onChange: (tagId: string | undefined, tag?: Tag) => void;
  placeholder?: string;
  className?: string;
}

export const TagSelect: React.FC<TagSelectProps> = ({
  value,
  onChange,
  placeholder = 'Etiqueta (Opcional)',
  className,
}) => {
  const { tags, createTag } = useApi();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [newIcon, setNewIcon] = useState(DEFAULT_TAG_ICON_NAME);
  const [isCreating, setIsCreating] = useState(false);

  const selectedTag = useMemo(() => {
    return tags.find((t) => t.id === value);
  }, [tags, value]);

  const filteredTags = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tags;
    return tags.filter((t) => t.name.toLowerCase().includes(q));
  }, [tags, search]);

  const exactMatch = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return tags.some((t) => t.name.toLowerCase() === q);
  }, [tags, search]);

  const handleSelect = (tag?: Tag) => {
    if (tag) {
      onChange(tag.id, tag);
    } else {
      onChange(undefined, undefined);
    }
    setOpen(false);
    setSearch('');
  };

  const handleCreate = async () => {
    const name = search.trim();
    if (!name) return;
    setIsCreating(true);
    try {
      const created = await createTag({ name, icon: newIcon });
      toast.success(`Etiqueta "${created.name}" creada`);
      onChange(created.id, created);
      setOpen(false);
      setSearch('');
      setNewIcon(DEFAULT_TAG_ICON_NAME);
    } catch (err: any) {
      toast.error(err?.message || 'Error al crear la etiqueta');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn(
              'h-9 w-full justify-between font-normal text-xs px-3 bg-card',
              !selectedTag && 'text-muted-foreground',
              className
            )}
          >
            <div className="flex items-center gap-2 truncate">
              {selectedTag ? (
                <>
                  <TagIcon name={selectedTag.icon} className="size-3.5 text-primary shrink-0" />
                  <span className="truncate text-foreground font-medium">{selectedTag.name}</span>
                </>
              ) : (
                <span>{placeholder}</span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-1">
              {selectedTag && (
                <span
                  role="button"
                  tabIndex={0}
                  className="p-0.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(undefined, undefined);
                  }}
                  title="Quitar etiqueta"
                >
                  <X className="size-3" />
                </span>
              )}
              <ChevronsUpDown className="size-3.5 opacity-50" />
            </div>
          </Button>
        }
      />
      <PopoverContent align="start" className="w-64 p-2 flex flex-col gap-2">
        <div className="relative">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar o crear..."
            className="h-8 pl-8 text-xs"
          />
        </div>

        <div className="max-h-48 overflow-y-auto flex flex-col gap-0.5 pr-0.5">
          {/* None option */}
          <button
            type="button"
            onClick={() => handleSelect(undefined)}
            className={cn(
              'flex items-center justify-between w-full px-2 py-1.5 rounded text-xs transition-colors hover:bg-accent text-left',
              !selectedTag && 'bg-accent/60 font-medium'
            )}
          >
            <span className="text-muted-foreground italic">Ninguna</span>
            {!selectedTag && <Check className="size-3.5 text-primary" />}
          </button>

          {/* List of tags */}
          {filteredTags.map((tag) => {
            const isSelected = tag.id === value;
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleSelect(tag)}
                className={cn(
                  'flex items-center justify-between w-full px-2 py-1.5 rounded text-xs transition-colors hover:bg-accent text-left',
                  isSelected && 'bg-accent/60 font-medium'
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <TagIcon name={tag.icon} className="size-3.5 text-primary shrink-0" />
                  <span className="truncate">{tag.name}</span>
                </div>
                {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
              </button>
            );
          })}

          {filteredTags.length === 0 && search.trim() && exactMatch && (
            <div className="py-2 text-center text-xs text-muted-foreground">
              No se encontraron etiquetas
            </div>
          )}
        </div>

        {/* Quick create section if search has text and is not already an exact match */}
        {!exactMatch && search.trim() && (
          <div className="pt-2 border-t border-border/50 flex flex-col gap-1.5">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Nueva etiqueta
            </span>
            <div className="flex items-center gap-1.5">
              <IconPickerPopover
                value={newIcon}
                onChange={setNewIcon}
                className="size-8"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleCreate}
                disabled={isCreating}
                className="h-8 flex-1 text-xs justify-start px-2.5 truncate"
              >
                <Plus data-icon="inline-start" />
                <span className="truncate">Crear "{search.trim()}"</span>
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
