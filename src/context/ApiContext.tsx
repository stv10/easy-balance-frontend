import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Account,
  DashboardSummary,
  BudgetConfig,
  MonthlyBudgetConfig,
  FixedExpense,
  Expense,
  SSPRequest,
  SSPResponse,
  Tag,
  MonthlyExpensesAnalytics,
  TagMonthHistory,
  CreateExpenseDTO,
  UpdateExpenseDTO,
} from '../types/api';

interface ApiContextType {
  accounts: Account[];
  tags: Tag[];
  summary: DashboardSummary | null;
  isLoading: boolean;
  token: string | null;
  username: string | null;
  expenseVersion: number;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loadAccounts: () => Promise<void>;
  loadTags: () => Promise<void>;
  loadSummary: (yearMonth?: string) => Promise<void>;
  loadAll: (yearMonth?: string) => void;
  getConfig: () => Promise<BudgetConfig>;
  updateConfig: (config: BudgetConfig) => Promise<BudgetConfig>;
  addAccount: (account: Account) => Promise<Account>;
  updateAccount: (id: string, account: Account) => Promise<Account>;
  deleteAccount: (id: string) => Promise<void>;
  createTag: (tag: { name: string; icon?: string; color?: string }) => Promise<Tag>;
  updateTag: (id: string, tag: { name: string; icon: string; color?: string }) => Promise<Tag>;
  deleteTag: (id: string) => Promise<void>;
  getFixedExpenses: () => Promise<FixedExpense[]>;
  addFixedExpense: (expense: FixedExpense) => Promise<FixedExpense>;
  updateFixedExpense: (id: string, expense: FixedExpense) => Promise<FixedExpense>;
  deleteFixedExpense: (id: string) => Promise<void>;
  getExpenses: () => Promise<Expense[]>;
  getExpensesSSP: (request: SSPRequest) => Promise<SSPResponse<Expense>>;
  createExpenses: (expenses: CreateExpenseDTO[]) => Promise<Expense[]>;
  addExpense: (expense: CreateExpenseDTO) => Promise<Expense>;
  updateExpenses: (expenses: UpdateExpenseDTO[]) => Promise<Expense[]>;
  deleteExpense: (id: string) => Promise<void>;
  getMonthlyExpensesAnalytics: (yearMonth?: string) => Promise<MonthlyExpensesAnalytics>;
  getTagHistory: (tagId: string | null, yearMonth?: string) => Promise<TagMonthHistory[]>;
  getExpensesByTag: (tagId: string | null, yearMonth?: string) => Promise<Expense[]>;
  updateExpenseTag: (expenseId: string, tagId: string | null) => Promise<Expense>;
  bulkUpdateExpenseTag: (expenseIds: string[], tagId: string | null) => Promise<Expense[]>;
  generateMonthlyExpenses: (yearMonth: string) => Promise<void>;
  regenerateMonthlyExpenses: (yearMonth: string) => Promise<void>;
  updateMonthlyBudget: (yearMonth: string, config: MonthlyBudgetConfig) => Promise<void>;
  resetMonthlyBudget: (yearMonth: string) => Promise<void>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expenseVersion, setExpenseVersion] = useState(0);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername(null);
    setAccounts([]);
    setTags([]);
    setSummary(null);
  };

  const login = async (u: string, p: string): Promise<boolean> => {
    try {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p }),
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      setToken(data.token);
      setUsername(data.username);
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      return false;
    }
  };

  const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401 || res.status === 403) {
      logout();
    }
    return res;
  };

  const loadAccounts = async () => {
    try {
      const res = await authenticatedFetch(`${baseUrl}/accounts`);
      if (!res.ok) throw new Error('Failed to load accounts');
      const data = await res.json();
      setAccounts(data);
    } catch (err) {
      console.error('Error loading accounts:', err);
    }
  };

  const loadTags = async () => {
    try {
      const res = await authenticatedFetch(`${baseUrl}/tags`);
      if (!res.ok) throw new Error('Failed to load tags');
      const data = await res.json();
      setTags(data);
    } catch (err) {
      console.error('Error loading tags:', err);
    }
  };

  const loadSummary = async (yearMonth?: string) => {
    try {
      const url = yearMonth
        ? `${baseUrl}/dashboard/summary?yearMonth=${yearMonth}`
        : `${baseUrl}/dashboard/summary`;
      const res = await authenticatedFetch(url);
      if (!res.ok) throw new Error('Failed to load summary');
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error('Error loading summary:', err);
    }
  };

  const loadAll = (yearMonth?: string) => {
    setIsLoading(true);
    Promise.all([loadAccounts(), loadSummary(yearMonth), loadTags()]).finally(() => {
      setIsLoading(false);
    });
  };

  const createTag = async (tagData: { name: string; icon?: string; color?: string }): Promise<Tag> => {
    const res = await authenticatedFetch(`${baseUrl}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tagData),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Failed to create tag');
    }
    const created = await res.json();
    setTags((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    return created;
  };

  const updateTag = async (id: string, tagData: { name: string; icon: string; color?: string }): Promise<Tag> => {
    const res = await authenticatedFetch(`${baseUrl}/tags/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tagData),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Failed to update tag');
    }
    const updated = await res.json();
    setTags((prev) => prev.map((t) => (t.id === id ? updated : t)).sort((a, b) => a.name.localeCompare(b.name)));
    return updated;
  };

  const deleteTag = async (id: string): Promise<void> => {
    const res = await authenticatedFetch(`${baseUrl}/tags/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete tag');
    setTags((prev) => prev.filter((t) => t.id !== id));
  };

  const getConfig = async (): Promise<BudgetConfig> => {
    const res = await authenticatedFetch(`${baseUrl}/config`);
    if (!res.ok) throw new Error('Failed to fetch config');
    return res.json();
  };

  const updateConfig = async (config: BudgetConfig): Promise<BudgetConfig> => {
    const res = await authenticatedFetch(`${baseUrl}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error('Failed to update config');
    return res.json();
  };

  const addAccount = async (account: Account): Promise<Account> => {
    const res = await authenticatedFetch(`${baseUrl}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account),
    });
    if (!res.ok) throw new Error('Failed to add account');
    return res.json();
  };

  const updateAccount = async (id: string, account: Account): Promise<Account> => {
    const res = await authenticatedFetch(`${baseUrl}/accounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account),
    });
    if (!res.ok) throw new Error('Failed to update account');
    return res.json();
  };

  const deleteAccount = async (id: string): Promise<void> => {
    const res = await authenticatedFetch(`${baseUrl}/accounts/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete account');
  };

  const getFixedExpenses = async (): Promise<FixedExpense[]> => {
    const res = await authenticatedFetch(`${baseUrl}/fixed-expenses`);
    if (!res.ok) throw new Error('Failed to fetch fixed expenses');
    return res.json();
  };

  const addFixedExpense = async (expense: FixedExpense): Promise<FixedExpense> => {
    const res = await authenticatedFetch(`${baseUrl}/fixed-expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    if (!res.ok) throw new Error('Failed to add fixed expense');
    return res.json();
  };

  const updateFixedExpense = async (id: string, expense: FixedExpense): Promise<FixedExpense> => {
    const res = await authenticatedFetch(`${baseUrl}/fixed-expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    if (!res.ok) throw new Error('Failed to update fixed expense');
    return res.json();
  };

  const deleteFixedExpense = async (id: string): Promise<void> => {
    const res = await authenticatedFetch(`${baseUrl}/fixed-expenses/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete fixed expense');
  };

  const getExpenses = async (): Promise<Expense[]> => {
    const res = await authenticatedFetch(`${baseUrl}/expenses`);
    if (!res.ok) throw new Error('Failed to fetch expenses');
    return res.json();
  };

  const getExpensesSSP = async (request: SSPRequest): Promise<SSPResponse<Expense>> => {
    const res = await authenticatedFetch(`${baseUrl}/expenses/ssp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error('Failed to fetch page of expenses');
    return res.json();
  };

  const createExpenses = async (expenses: CreateExpenseDTO[]): Promise<Expense[]> => {
    const res = await authenticatedFetch(`${baseUrl}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenses),
    });
    if (!res.ok) throw new Error('Failed to add expenses');
    const result = await res.json();
    setExpenseVersion(v => v + 1);
    await loadAccounts();
    return result;
  };

  const addExpense = async (expense: CreateExpenseDTO): Promise<Expense> => {
    const result = await createExpenses([expense]);
    return result[0];
  };

  const updateExpenses = async (expenses: UpdateExpenseDTO[]): Promise<Expense[]> => {
    const res = await authenticatedFetch(`${baseUrl}/expenses`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenses),
    });
    if (!res.ok) throw new Error('Failed to update expenses');
    const result = await res.json();
    setExpenseVersion(v => v + 1);
    await loadAccounts();
    return result;
  };

  const deleteExpense = async (id: string): Promise<void> => {
    const res = await authenticatedFetch(`${baseUrl}/expenses/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete expense');
    setExpenseVersion(v => v + 1);
  };

  const getMonthlyExpensesAnalytics = async (yearMonth?: string): Promise<MonthlyExpensesAnalytics> => {
    const url = yearMonth
      ? `${baseUrl}/expenses/analytics/monthly?yearMonth=${encodeURIComponent(yearMonth)}`
      : `${baseUrl}/expenses/analytics/monthly`;
    const res = await authenticatedFetch(url);
    if (!res.ok) throw new Error('Failed to load monthly expenses analytics');
    return res.json();
  };

  const getTagHistory = async (tagId: string | null, yearMonth?: string): Promise<TagMonthHistory[]> => {
    const params = new URLSearchParams();
    if (tagId) params.append('tagId', tagId);
    if (yearMonth) params.append('yearMonth', yearMonth);
    const res = await authenticatedFetch(`${baseUrl}/expenses/analytics/tag-history?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load tag history');
    return res.json();
  };

  const getExpensesByTag = async (tagId: string | null, yearMonth?: string): Promise<Expense[]> => {
    const params = new URLSearchParams();
    if (tagId) params.append('tagId', tagId);
    if (yearMonth) params.append('yearMonth', yearMonth);
    const res = await authenticatedFetch(`${baseUrl}/expenses/by-tag?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load expenses by tag');
    return res.json();
  };

  const updateExpenseTag = async (expenseId: string, tagId: string | null): Promise<Expense> => {
    const res = await authenticatedFetch(`${baseUrl}/expenses/${expenseId}/tag`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tagId }),
    });
    if (!res.ok) throw new Error('Failed to update expense tag');
    setExpenseVersion((v) => v + 1);
    return res.json();
  };

  const bulkUpdateExpenseTag = async (expenseIds: string[], tagId: string | null): Promise<Expense[]> => {
    const res = await authenticatedFetch(`${baseUrl}/expenses/bulk-tag`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expenseIds, tagId }),
    });
    if (!res.ok) throw new Error('Failed to bulk update expense tags');
    setExpenseVersion((v) => v + 1);
    return res.json();
  };

  const generateMonthlyExpenses = async (yearMonth: string): Promise<void> => {
    const res = await authenticatedFetch(`${baseUrl}/dashboard/generate?yearMonth=${yearMonth}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to generate monthly expenses');
    const data = await res.json();
    setSummary(data);
  };

  const regenerateMonthlyExpenses = async (yearMonth: string): Promise<void> => {
    const res = await authenticatedFetch(`${baseUrl}/dashboard/regenerate?yearMonth=${encodeURIComponent(yearMonth)}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to regenerate monthly expenses');
    const data = await res.json();
    setSummary(data);
    await Promise.all([
      loadAccounts(),
      loadSummary(yearMonth),
    ]);
    setExpenseVersion(v => v + 1);
  };

  const updateMonthlyBudget = async (yearMonth: string, config: MonthlyBudgetConfig): Promise<void> => {
    const res = await authenticatedFetch(`${baseUrl}/dashboard/budget?yearMonth=${encodeURIComponent(yearMonth)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error('Failed to update monthly budget');
    const data = await res.json();
    setSummary(data);
  };

  const resetMonthlyBudget = async (yearMonth: string): Promise<void> => {
    const res = await authenticatedFetch(`${baseUrl}/dashboard/budget/reset?yearMonth=${encodeURIComponent(yearMonth)}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to reset monthly budget');
    const data = await res.json();
    setSummary(data);
  };

  useEffect(() => {
    if (token) {
      loadAll();
    }
  }, [token]);

  return (
    <ApiContext.Provider
      value={{
        accounts,
        tags,
        summary,
        isLoading,
        token,
        username,
        expenseVersion,
        login,
        logout,
        loadAccounts,
        loadTags,
        loadSummary,
        loadAll,
        getConfig,
        updateConfig,
        addAccount,
        updateAccount,
        deleteAccount,
        createTag,
        updateTag,
        deleteTag,
        getFixedExpenses,
        addFixedExpense,
        updateFixedExpense,
        deleteFixedExpense,
        getExpenses,
        getExpensesSSP,
        createExpenses,
        addExpense,
        updateExpenses,
        deleteExpense,
        getMonthlyExpensesAnalytics,
        getTagHistory,
        getExpensesByTag,
        updateExpenseTag,
        bulkUpdateExpenseTag,
        generateMonthlyExpenses,
        regenerateMonthlyExpenses,
        updateMonthlyBudget,
        resetMonthlyBudget,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};
