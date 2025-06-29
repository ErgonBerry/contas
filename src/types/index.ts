export interface Transaction {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  description: string;
  category: string;
  date: string;
  dueDate?: string; // Data de vencimento para gastos pendentes
  isPaid: boolean; // Status de pagamento
  recurrence: 'none' | 'weekly' | 'monthly' | 'yearly';
  createdAt: string;
}

export interface SavingsContribution {
  id: string;
  amount: number;
  date: string; // Data do aporte
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  contributions: SavingsContribution[]; // Histórico de aportes
  createdAt: string;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
  goalsImpact?: number;
}

export interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface PendingPayment {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  category: string;
  isOverdue: boolean;
  daysUntilDue: number;
}