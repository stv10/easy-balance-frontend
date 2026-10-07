export interface BudgetConfig {
  id?: string;
  totalAmount: number;
  vidaPercentage: number;
  ocioPercentage: number;
  inversionPercentage: number;
}

export interface MonthlyBudgetConfig {
  totalAmount: number;
  vidaPercentage: number;
  ocioPercentage: number;
  inversionPercentage: number;
  isCustom?: boolean;
}

export interface Account {
  id?: string;
  name: string;
  balance: number;
}

export interface Tag {
  id: string;
  name: string;
  icon: string;
  color?: string;
}

export interface FixedExpense {
  id?: string;
  description: string;
  amount: number;
  category: string;
  dueDay?: number;
  tag?: Tag;
  tagId?: string;
}

export interface Expense {
  id?: string;
  description: string;
  amount: number;
  category: string;
  createdAt?: string;
  accountId?: string;
  fixedExpenseId?: string;
  tag?: Tag;
  tagId?: string;
}

export interface MonthlyFixedExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  dueDay: number;
  paid: boolean;
  actualAmount?: number;
  expenseId?: string;
  accountId?: string;
  tag?: Tag;
}

export interface CategorySummary {
  assignedBudget: number;
  totalFixedExpenses: number;
  totalVariableExpenses: number;
  remainingBudget: number;
}

export interface DashboardSummary {
  totalBudget: number;
  totalRemaining: number;
  categories: { [key: string]: CategorySummary };
  fixedExpenses: MonthlyFixedExpense[];
  generated?: boolean;
  budgetConfig?: MonthlyBudgetConfig;
}

export interface SSPFilter {
  key: string;
  value: string;
}

export interface SSPRequest {
  pageIndex: number;
  pageSize: number;
  filters: SSPFilter[];
}

export interface SSPResponse<T> {
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  data: T[];
}

export interface MonthlyTagSummary {
  tagId: string | null;
  tagName: string;
  tagIcon: string;
  tagColor: string;
  totalAmount: number;
  percentage: number;
  count: number;
}

export interface MonthlyExpensesAnalytics {
  yearMonth: string;
  totalAmount: number;
  tagSummaries: MonthlyTagSummary[];
}

export interface TagMonthHistory {
  yearMonth: string;
  label: string;
  amount: number;
  isCurrent: boolean;
}

export interface BulkUpdateExpenseTagRequest {
  expenseIds: string[];
  tagId: string | null;
}

export interface CreateExpenseDTO {
  description: string;
  amount: number;
  category: string;
  createdAt?: string;
  accountId?: string | null;
  tagId?: string | null;
  fixedExpenseId?: string | null;
}

export interface UpdateExpenseDTO {
  id: string;
  description: string;
  amount: number;
  category: string;
  createdAt?: string;
  accountId?: string | null;
  tagId?: string | null;
  fixedExpenseId?: string | null;
}

