import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import type { TagMonthHistory } from '@/types/api';
import { Skeleton } from '@/components/ui/skeleton';
import { UNTAGGED_COLOR } from '@/lib/tag-icons';

interface TagHistoryBarChartProps {
  data: TagMonthHistory[];
  tagColor?: string;
  isLoading?: boolean;
  className?: string;
}

export const TagHistoryBarChart: React.FC<TagHistoryBarChartProps> = ({
  data,
  tagColor,
  isLoading,
  className,
}) => {
  const baseColor = tagColor || UNTAGGED_COLOR;

  const formatCurrency = (val: number) => {
    return `$${Math.round(val).toLocaleString('es-AR')}`;
  };

  if (isLoading) {
    return (
      <div className={`w-full h-44 flex flex-col justify-end gap-2 p-2 ${className || ''}`}>
        <div className="flex items-end justify-between gap-2 h-36">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="flex-1 h-full rounded-t-md opacity-60" />
          ))}
        </div>
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  return (
    <div className={`w-full h-48 sm:h-56 md:h-64 ${className || ''}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 12, right: 12, left: -14, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            tickFormatter={(val) => `$${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as TagMonthHistory;
                return (
                  <div className="bg-popover border border-border shadow-md rounded-lg p-2 text-xs">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className="font-semibold text-foreground">{item.label}</span>
                      {item.isCurrent && (
                        <span className="bg-primary/10 text-primary text-[10px] font-semibold px-1.5 py-0.2 rounded-full">
                          Seleccionado
                        </span>
                      )}
                    </div>
                    <div className="text-muted-foreground flex justify-between gap-3">
                      <span>Total:</span>
                      <span className="font-bold text-foreground font-mono">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="amount" radius={[5, 5, 0, 0]} maxBarSize={56}>
            {data.map((entry, index) => {
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={baseColor}
                  fillOpacity={entry.isCurrent ? 1.0 : 0.45}
                  stroke={entry.isCurrent ? baseColor : 'transparent'}
                  strokeWidth={entry.isCurrent ? 2 : 0}
                  className="transition-opacity duration-200"
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
