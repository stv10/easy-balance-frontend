import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface MonthSelectorProps {
  currentDate: Date;
  onMonthChange: (date: Date) => void;
  rightSlot?: React.ReactNode;
  className?: string;
}

export const formatMonthDisplay = (date: Date): string => {
  let str = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
  str = str.charAt(0).toUpperCase() + str.slice(1);
  return str.replace('.', '');
};

export const toYearMonthString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  currentDate,
  onMonthChange,
  rightSlot,
  className,
}) => {
  const getMonthList = (centerDate: Date) => {
    const list: Date[] = [];
    for (let i = -2; i <= 2; i++) {
      const d = new Date(centerDate.getFullYear(), centerDate.getMonth() + i, 1);
      list.push(d);
    }
    return list;
  };

  const handlePrevMonth = () => {
    onMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const months = getMonthList(currentDate);

  return (
    <div
      className={cn(
        'flex items-center justify-between bg-muted/40 p-2.5 rounded-xl border border-border/50 shadow-sm gap-2',
        className
      )}
    >
      <Button
        variant="ghost"
        type="button"
        size="icon"
        className="h-9 w-9 hover:bg-muted shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
        onClick={handlePrevMonth}
        title="Mes anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="flex items-center justify-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full">
        {months.map((m, index) => {
          const isSelected =
            m.getFullYear() === currentDate.getFullYear() &&
            m.getMonth() === currentDate.getMonth();
          return (
            <button
              key={index}
              type="button"
              onClick={() => onMonthChange(m)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shrink-0 select-none cursor-pointer',
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-md scale-105'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
              )}
            >
              {formatMonthDisplay(m)}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          type="button"
          size="icon"
          className="h-9 w-9 hover:bg-muted shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={handleNextMonth}
          title="Mes siguiente"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        {rightSlot}
      </div>
    </div>
  );
};
