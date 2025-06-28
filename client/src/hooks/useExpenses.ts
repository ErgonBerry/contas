import { useState, useEffect, useCallback } from 'react';
import { Expense, ExpenseFilter, ExpenseSummary, ExpenseCategory } from '../types/expense';
import { generateUUID } from '../utils/uuid';

const API_URL = 'http://localhost:5000/api/expenses';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Load expenses from the API
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        console.log('Fetched expenses:', data);
        setExpenses(data);
      } catch (error) {
        console.error('Error loading expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExpense),
      });
      const savedExpense = await response.json();
      setExpenses(prev => [...prev, savedExpense]);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  }, []);

  const updateExpense = useCallback(async (id: string, updates: Partial<Expense>) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...updates, updatedAt: new Date().toISOString() }),
      });
      const updatedExpense = await response.json();
      setExpenses(prev => prev.map(expense => 
        expense.id === id ? updatedExpense : expense
      ));
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      setExpenses(prev => prev.filter(expense => expense.id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  }, []);

  const toggleExpensePaid = useCallback(async (id: string) => {
    try {
      const expenseToUpdate = expenses.find(expense => expense.id === id);
      if (!expenseToUpdate) return;

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paid: !expenseToUpdate.paid, updatedAt: new Date().toISOString() }),
      });
      const updatedExpense = await response.json();
      setExpenses(prev => prev.map(expense => 
        expense.id === id ? updatedExpense : expense
      ));
    } catch (error) {
      console.error('Error toggling paid status:', error);
    }
  }, [expenses]);

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