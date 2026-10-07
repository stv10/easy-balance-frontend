import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { MonthlyTagSummary } from '@/types/api';
import { UNTAGGED_COLOR } from '@/lib/tag-icons';

interface ExpensesDonutChartProps {
  totalAmount: number;
  tagSummaries: MonthlyTagSummary[];
  onSelectTag?: (tagId: string | null) => void;
  selectedTagId?: string | null;
  className?: string;
}

export const ExpensesDonutChart: React.FC<ExpensesDonutChartProps> = ({
  totalAmount,
  tagSummaries,
  onSelectTag,
  selectedTagId,
  className,
}) => {
  const hasData = totalAmount > 0 && tagSummaries.length > 0;

  const data = hasData
    ? tagSummaries.map((s) => ({
        name: s.tagName,
        value: s.totalAmount,
        color: s.tagColor || UNTAGGED_COLOR,
        percentage: s.percentage,
        tagId: s.tagId,
        count: s.count,
      }))
    : [{ name: 'Sin gastos', value: 1, color: '#e2e8f0', percentage: 0, tagId: null, count: 0 }];

  const formatCurrency = (val: number) => {
    return `$${Math.round(val).toLocaleString('es-AR')}`;
  };

  return (
    <div className={`relative w-full h-[260px] sm:h-[300px] flex items-center justify-center ${className || ''}`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="65%"
            outerRadius="88%"
            paddingAngle={hasData ? 3 : 0}
            dataKey="value"
            cursor={hasData && onSelectTag ? 'pointer' : 'default'}
            onClick={(entry: any) => {
              if (hasData && onSelectTag) {
                const tagId = entry?.tagId !== undefined ? entry.tagId : entry?.payload?.tagId;
                onSelectTag(tagId);
              }
            }}
          >
            {data.map((entry, index) => {
              const isSelected = selectedTagId !== undefined && selectedTagId === entry.tagId;
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={isSelected ? 'var(--foreground)' : 'transparent'}
                  strokeWidth={isSelected ? 2 : 0}
                  className="transition-all duration-300 hover:opacity-85"
                />
              );
            })}
          </Pie>

          {hasData && (
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-popover/95 border border-border shadow-lg rounded-lg p-2.5 text-xs backdrop-blur-sm z-50">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="size-2.5 rounded-full inline-block"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-semibold text-foreground">{item.name}</span>
                      </div>
                      <div className="text-muted-foreground flex justify-between gap-4">
                        <span>Total:</span>
                        <span className="font-semibold text-foreground font-mono">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                      <div className="text-muted-foreground flex justify-between gap-4">
                        <span>Participación:</span>
                        <span className="font-semibold text-primary font-mono">
                          {item.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-muted-foreground flex justify-between gap-4">
                        <span>Movimientos:</span>
                        <span className="text-foreground">{item.count}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>

      {/* Center Label inside Donut */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Total Gastos
        </span>
        <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono mt-0.5">
          {formatCurrency(totalAmount)}
        </span>
        <span className="text-[11px] text-muted-foreground/80 mt-0.5">
          {hasData ? `${tagSummaries.length} categorías` : 'Sin registros'}
        </span>
      </div>
    </div>
  );
};
