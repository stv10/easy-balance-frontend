import React from 'react';
import type { MonthlyTagSummary } from '@/types/api';
import { TagIcon } from '@/components/ui/TagIcon';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, HelpCircle } from 'lucide-react';
import { UNTAGGED_COLOR } from '@/lib/tag-icons';
import { cn } from '@/lib/utils';

interface TagSummaryListProps {
  tagSummaries: MonthlyTagSummary[];
  onSelectTag: (summary: MonthlyTagSummary) => void;
  selectedTagId?: string | null;
  className?: string;
}

export const TagSummaryList: React.FC<TagSummaryListProps> = ({
  tagSummaries,
  onSelectTag,
  selectedTagId,
  className,
}) => {
  const formatCurrency = (val: number) => {
    return `$${Math.round(val).toLocaleString('es-AR')}`;
  };

  if (tagSummaries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-xl border-border/80 bg-muted/20">
        <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-2">
          <HelpCircle className="size-5" />
        </div>
        <p className="text-sm font-medium text-foreground">No hay gastos registrados</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Agrega nuevos gastos con etiquetas para ver el desglose mensual.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {tagSummaries.map((summary) => {
        const isSelected = selectedTagId !== undefined && selectedTagId === summary.tagId;
        const color = summary.tagColor || UNTAGGED_COLOR;

        return (
          <div
            key={summary.tagId || 'untagged'}
            onClick={() => onSelectTag(summary)}
            className={cn(
              'group flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none',
              'hover:bg-muted/50 hover:shadow-sm active:scale-[0.99]',
              isSelected
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border/60 bg-card hover:border-border'
            )}
          >
            {/* Left: Icon and Name */}
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div
                className="size-9 rounded-lg border flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105"
                style={{
                  backgroundColor: `${color}1a`,
                  borderColor: `${color}40`,
                  color: color,
                }}
              >
                <TagIcon name={summary.tagIcon} className="size-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-xs sm:text-sm text-foreground truncate group-hover:text-primary transition-colors">
                  {summary.tagName}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {summary.count} {summary.count === 1 ? 'movimiento' : 'movimientos'}
                </span>
              </div>
            </div>

            {/* Right: Amount, Percentage Badge, and Arrow */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="flex flex-col items-end">
                <span className="font-bold text-xs sm:text-sm font-mono text-foreground">
                  {formatCurrency(summary.totalAmount)}
                </span>
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-4 font-mono font-medium"
                  style={{
                    backgroundColor: `${color}15`,
                    color: color,
                    borderColor: `${color}30`,
                  }}
                >
                  {summary.percentage.toFixed(1)}%
                </Badge>
              </div>

              <ChevronRight className="size-4 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
