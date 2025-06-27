import { useState, useEffect, useCallback } from 'react';
import { Expense, ExpenseFilter, ExpenseSummary, ExpenseCategory } from '../types/expense';

const STORAGE_KEY = 'household-expenses';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Load expenses from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setExpenses(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save expenses to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    }
  }, [expenses, loading]);

  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setExpenses(prev => [...prev, newExpense]);
  }, []);

  const updateExpense = useCallback((id: string, updates: Partial<Expense>) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === id 
        ? { ...expense, ...updates, updatedAt: new Date().toISOString() }
        : expense
    ));
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  }, []);

  const toggleExpensePaid = useCallback((id: string) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === id 
        ? { ...expense, paid: !expense.paid, updatedAt: new Date().toISOString() }
        : expense
    ));
  }, []);

  const getFilteredExpenses = useCallback((filter: ExpenseFilter = {}) => {
    return expenses.filter(expense => {
      if (filter.category && expense.category !== filter.category) return false;
      if (filter.paid !== undefined && expense.paid !== filter.paid) return false;
      if (filter.user && expense.createdBy !== filter.user) return false;
      if (filter.dateRange) {
        const expenseDate = new Date(expense.dueDate);
        const startDate = new Date(filter.dateRange.start);
        const endDate = new Date(filter.dateRange.end);
        if (expenseDate < startDate || expenseDate > endDate) return false;
      }
      return true;
    });
  }, [expenses]);

  const getExpenseSummary = useCallback((filter: ExpenseFilter = {}): ExpenseSummary => {
    const filteredExpenses = getFilteredExpenses(filter);
    
    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const paidAmount = filteredExpenses
      .filter(expense => expense.paid)
      .reduce((sum, expense) => sum + expense.amount, 0);
    const pendingAmount = totalAmount - paidAmount;

    const categoryBreakdown = filteredExpenses.reduce((breakdown, expense) => {
      breakdown[expense.category] = (breakdown[expense.category] || 0) + expense.amount;
      return breakdown;
    }, {} as Record<ExpenseCategory, number>);

    // Calculate monthly forecast based on recurring expenses
    const monthlyRecurring = expenses
      .filter(expense => expense.recurring && expense.recurrenceType === 'monthly')
      .reduce((sum, expense) => sum + expense.amount, 0);

    return {
      totalAmount,
      paidAmount,
      pendingAmount,
      categoryBreakdown,
      monthlyForecast: monthlyRecurring,
    };
  }, [expenses, getFilteredExpenses]);

  return {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    toggleExpensePaid,
    getFilteredExpenses,
    getExpenseSummary,
  };
}