import React, { useState, useMemo } from 'react';
import { TAG_ICONS_LIST, DEFAULT_TAG_ICON_NAME } from '@/lib/tag-icons';
import { TagIcon } from './TagIcon';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
} from './popover';
import { Button } from './button';
import { Input } from './input';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

interface IconPickerPopoverProps {
  value?: string;
  onChange: (iconName: string) => void;
  className?: string;
}

export const IconPickerPopover: React.FC<IconPickerPopoverProps> = ({
  value = DEFAULT_TAG_ICON_NAME,
  onChange,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredIcons = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return TAG_ICONS_LIST;
    return TAG_ICONS_LIST.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.label.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
  }, [search]);

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn('size-9 p-0 flex items-center justify-center shrink-0', className)}
            title="Seleccionar icono"
          >
            <TagIcon name={value} className="size-4" />
          </Button>
        }
      />
      <PopoverContent align="start" className="w-72 p-3 flex flex-col gap-2.5">
        <PopoverHeader className="pb-1 border-b border-border/50">
          <PopoverTitle className="text-xs font-semibold">Seleccionar Icono</PopoverTitle>
        </PopoverHeader>

        <div className="relative">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar icono..."
            className="h-8 pl-8 text-xs"
          />
        </div>

        <div className="max-h-48 overflow-y-auto pr-1 grid grid-cols-6 gap-1.5">
          {filteredIcons.map((item) => {
            const isSelected = item.name === value;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => handleSelect(item.name)}
                className={cn(
                  'size-8 rounded-md flex items-center justify-center transition-colors hover:bg-accent text-foreground/80 hover:text-foreground',
                  isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90'
                )}
                title={`${item.label} (${item.category})`}
              >
                <item.icon className="size-4" />
              </button>
            );
          })}
          {filteredIcons.length === 0 && (
            <div className="col-span-6 py-4 text-center text-xs text-muted-foreground">
              No se encontraron iconos
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
