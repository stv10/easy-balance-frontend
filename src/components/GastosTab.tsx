import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '@/context/ApiContext';
import type { MonthlyExpensesAnalytics, MonthlyTagSummary } from '@/types/api';
import { MonthSelector, toYearMonthString } from './MonthSelector';
import { ExpensesDonutChart } from './gastos/ExpensesDonutChart';
import { TagSummaryList } from './gastos/TagSummaryList';
import { TagDetailSheet } from './gastos/TagDetailSheet';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Receipt, PieChart, TrendingDown, Layers } from 'lucide-react';
import { toast } from 'sonner';

export const GastosTab: React.FC = () => {
  const { getMonthlyExpensesAnalytics, expenseVersion } = useApi();

  // Independent month state for Gastos tab
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [analytics, setAnalytics] = useState<MonthlyExpensesAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Selected tag for slide-over detail sheet
  const [selectedTag, setSelectedTag] = useState<MonthlyTagSummary | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  const yearMonthStr = toYearMonthString(currentDate);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMonthlyExpensesAnalytics(yearMonthStr);
      setAnalytics(data);
    } catch (err) {
      console.error('Error loading expenses analytics:', err);
      toast.error('Error al cargar analítica de gastos');
    } finally {
      setIsLoading(false);
    }
  }, [getMonthlyExpensesAnalytics, yearMonthStr]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics, expenseVersion]);

  const handleSelectTag = (summary: MonthlyTagSummary) => {
    setSelectedTag(summary);
    setIsDetailOpen(true);
  };

  const handleSliceClick = (tagId: string | null) => {
    if (!analytics) return;
    const found = analytics.tagSummaries.find((s) => s.tagId === tagId);
    if (found) {
      handleSelectTag(found);
    }
  };

  const formatCurrency = (val: number) => {
    return `$${Math.round(val).toLocaleString('es-AR')}`;
  };

  const totalAmount = analytics?.totalAmount || 0;
  const tagSummaries = analytics?.tagSummaries || [];
  const totalMovements = tagSummaries.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="flex flex-col gap-5 h-full min-h-0 overflow-y-auto pr-1 pb-4">
      {/* Standalone Month Selector */}
      <MonthSelector
        currentDate={currentDate}
        onMonthChange={setCurrentDate}
        className="w-full shrink-0"
      />

      {/* KPI Overview Banner */}
      <Card className="border-border shadow-xs bg-gradient-to-r from-card via-card to-primary/5 shrink-0">
        <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="size-11 sm:size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-2xs">
              <Receipt className="size-5 sm:size-6" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Total Gastado en el Mes
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono text-foreground">
                {isLoading ? (
                  <Skeleton className="h-8 w-32 mt-1" />
                ) : (
                  formatCurrency(totalAmount)
                )}
              </span>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
            <Badge variant="outline" className="text-xs font-medium gap-1 px-2.5 py-0.5">
              <Layers className="size-3 text-muted-foreground" />
              {tagSummaries.length} {tagSummaries.length === 1 ? 'etiqueta' : 'etiquetas'}
            </Badge>
            <span className="text-[11px] text-muted-foreground">
              {totalMovements} {totalMovements === 1 ? 'gasto registrado' : 'gastos registrados'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Content: Grid with Donut Chart and Tag Summary List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Donut Chart Card */}
        <Card className="lg:col-span-5 border-border shadow-xs flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <PieChart className="size-4 text-primary" />
              Distribución por Etiquetas
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Haz clic en cualquier segmento para ver el detalle de gastos
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 pb-5 flex flex-col items-center justify-center">
            {isLoading ? (
              <div className="w-full h-[260px] flex items-center justify-center">
                <Skeleton className="size-44 rounded-full" />
              </div>
            ) : (
              <ExpensesDonutChart
                totalAmount={totalAmount}
                tagSummaries={tagSummaries}
                onSelectTag={handleSliceClick}
                selectedTagId={selectedTag?.tagId}
              />
            )}
          </CardContent>
        </Card>

        {/* Tag Summaries List Card */}
        <Card className="lg:col-span-7 border-border shadow-xs flex flex-col">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingDown className="size-4 text-primary" />
                Desglose de Gastos
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Selecciona una etiqueta para ver su historial en 6 meses y gastos individuales
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-1">
            {isLoading ? (
              <div className="flex flex-col gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <TagSummaryList
                tagSummaries={tagSummaries}
                onSelectTag={handleSelectTag}
                selectedTagId={selectedTag?.tagId}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Slide-over Tag Detail Sheet */}
      <TagDetailSheet
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        tagSummary={selectedTag}
        yearMonth={yearMonthStr}
        onExpensesUpdated={loadAnalytics}
      />
    </div>
  );
};
