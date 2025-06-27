export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  dueDate: string;
  recurring: boolean;
  recurrenceType?: 'monthly' | 'weekly' | 'yearly';
  paid: boolean;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory = 
  | 'housing'
  | 'utilities'
  | 'internet'
  | 'food'
  | 'transport'
  | 'healthcare'
  | 'entertainment'
  | 'shopping'
  | 'education'
  | 'other';

export interface ExpenseFilter {
  category?: ExpenseCategory;
  paid?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  user?: string;
}

export interface ExpenseSummary {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  categoryBreakdown: Record<ExpenseCategory, number>;
  monthlyForecast: number;
}