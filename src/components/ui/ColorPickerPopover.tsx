import React from 'react';
import { CheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { TAG_SWATCHES } from '@/lib/tag-icons';
import { cn } from '@/lib/utils';

interface ColorPickerPopoverProps {
  color: string;
  onChange: (hex: string) => void;
  className?: string;
}

export const ColorPickerPopover: React.FC<ColorPickerPopoverProps> = ({
  color,
  onChange,
  className,
}) => {
  const currentSwatch = TAG_SWATCHES.find(
    (s) => s.hex.toLowerCase() === (color || '').toLowerCase()
  ) || TAG_SWATCHES[7]; // default Blue

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm" className={cn('h-8 gap-2 font-normal', className)}>
            <span
              className={cn('size-4 rounded-full border border-black/10 shrink-0 shadow-xs')}
              style={{ backgroundColor: color || currentSwatch.hex }}
              aria-hidden
            />
            <span className="font-mono text-xs">{color || currentSwatch.hex}</span>
          </Button>
        }
      />
      <PopoverContent align="start" className="w-auto p-3 z-50">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {TAG_SWATCHES.map((s) => {
            const isSelected = (color || '').toLowerCase() === s.hex.toLowerCase();
            return (
              <button
                key={s.hex}
                type="button"
                aria-label={s.name}
                title={s.name}
                onClick={() => onChange(s.hex)}
                className={cn(
                  'flex size-7 items-center justify-center rounded-md transition outline-none cursor-pointer',
                  'hover:scale-110 hover:ring-2 hover:ring-ring focus-visible:ring-2 focus-visible:ring-ring'
                )}
                style={{ backgroundColor: s.hex }}
              >
                {isSelected && (
                  <CheckIcon className="size-3.5 text-white drop-shadow" />
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
