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

export interface FixedExpense {
  id?: string;
  description: string;
  amount: number;
  category: string;
  dueDay?: number;
}

export interface Expense {
  id?: string;
  description: string;
  amount: number;
  category: string;
  createdAt?: string;
  accountId?: string;
  fixedExpenseId?: string;
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
