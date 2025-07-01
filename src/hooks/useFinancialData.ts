import { useState, useEffect } from 'react';
import { Transaction, SavingsGoal, SavingsContribution } from '../types';
import { generateId, getCurrentBrazilDate, getBrazilDateString } from '../utils/helpers';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const useFinancialData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transactionsRes, goalsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/transactions`),
          fetch(`${API_BASE_URL}/goals`),
        ]);

        if (!transactionsRes.ok || !goalsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const transactionsData = await transactionsRes.json();
        const goalsData = await goalsRes.json();

        setTransactions(transactionsData);
        setSavingsGoals(goalsData);
      } catch (error) {
        console.error('Error fetching financial data:', error);
      }
    };

    fetchData();
  }, []);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transaction,
          createdAt: getCurrentBrazilDate().toISOString(),
        }),
      });
      if (!response.ok) throw new Error('Failed to add transaction');
      const newTransaction = await response.json();
      setTransactions(prev => [newTransaction, ...prev]);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/\${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update transaction');
      setTransactions(prev => prev.map(transaction =>
        transaction._id === id ? { ...transaction, ...updates } : transaction
      ));
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/\${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete transaction');
      setTransactions(prev => prev.filter(t => t._id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const updatePaymentStatus = async (id: string, isPaid: boolean) => {
    // This logic might need to be adjusted based on how recurring transactions are handled in the backend
    // For now, assuming it's a direct update to an existing transaction
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/\${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaid }),
      });
      if (!response.ok) throw new Error('Failed to update payment status');
      setTransactions(prev => prev.map(transaction =>
        transaction._id === id ? { ...transaction, isPaid } : transaction
      ));
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const addSavingsGoal = async (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...goal,
          createdAt: getCurrentBrazilDate().toISOString(),
          contributions: [],
        }),
      });
      if (!response.ok) throw new Error('Failed to add savings goal');
      const newGoal = await response.json();
      setSavingsGoals(prev => [newGoal, ...prev]);
    } catch (error) {
      console.error('Error adding savings goal:', error);
    }
  };

  const updateSavingsGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/goals/\${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update savings goal');
      setSavingsGoals(prev => prev.map(goal =>
        goal._id === id ? { ...goal, ...updates } : goal
      ));
    } catch (error) {
      console.error('Error updating savings goal:', error);
    }
  };

  const addSavingsContribution = async (goalId: string, amount: number, date?: string) => {
    try {
      const goalToUpdate = savingsGoals.find(g => g._id === goalId);
      if (!goalToUpdate) throw new Error('Goal not found');

      const contribution: SavingsContribution = {
        id: generateId(), // Still generate client-side ID for contributions
        amount,
        date: date || getBrazilDateString(),
        createdAt: getCurrentBrazilDate().toISOString(),
      };

      const updatedContributions = [...(goalToUpdate.contributions || []), contribution];
      const newCurrentAmount = updatedContributions.reduce((sum, c) => sum + c.amount, 0);

      const response = await fetch(`${API_BASE_URL}/goals/\${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contributions: updatedContributions,
          currentAmount: newCurrentAmount,
        }),
      });
      if (!response.ok) throw new Error('Failed to add savings contribution');
      const updatedGoal = await response.json();
      setSavingsGoals(prev => prev.map(goal =>
        goal._id === goalId ? updatedGoal : goal
      ));
    } catch (error) {
      console.error('Error adding savings contribution:', error);
    }
  };

  const updateSavingsContribution = async (goalId: string, contributionId: string, updates: Partial<SavingsContribution>) => {
    try {
      const goalToUpdate = savingsGoals.find(g => g._id === goalId);
      if (!goalToUpdate) throw new Error('Goal not found');

      const updatedContributions = goalToUpdate.contributions.map(contribution =>
        contribution.id === contributionId ? { ...contribution, ...updates } : contribution
      );
      const newCurrentAmount = updatedContributions.reduce((sum, c) => sum + c.amount, 0);

      const response = await fetch(`${API_BASE_URL}/goals/\${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contributions: updatedContributions,
          currentAmount: newCurrentAmount,
        }),
      });
      if (!response.ok) throw new Error('Failed to update savings contribution');
      const updatedGoal = await response.json();
      setSavingsGoals(prev => prev.map(goal =>
        goal._id === goalId ? updatedGoal : goal
      ));
    } catch (error) {
      console.error('Error updating savings contribution:', error);
    }
  };

  const deleteSavingsContribution = async (goalId: string, contributionId: string) => {
    try {
      const goalToUpdate = savingsGoals.find(g => g._id === goalId);
      if (!goalToUpdate) throw new Error('Goal not found');

      const filteredContributions = goalToUpdate.contributions.filter(c => c.id !== contributionId);
      const newCurrentAmount = filteredContributions.reduce((sum, c) => sum + c.amount, 0);

      const response = await fetch(`${API_BASE_URL}/goals/\${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contributions: filteredContributions,
          currentAmount: newCurrentAmount,
        }),
      });
      if (!response.ok) throw new Error('Failed to delete savings contribution');
      const updatedGoal = await response.json();
      setSavingsGoals(prev => prev.map(goal =>
        goal._id === goalId ? updatedGoal : goal
      ));
    } catch (error) {
      console.error('Error deleting savings contribution:', error);
    }
  };

  const deleteSavingsGoal = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/goals/\${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete savings goal');
      setSavingsGoals(prev => prev.filter(g => g._id !== id));
    } catch (error) {
      console.error('Error deleting savings goal:', error);
    }
  };

  const importData = async (newTransactions: Transaction[], newSavingsGoals: SavingsGoal[]) => {
    // This function might need a dedicated backend endpoint for bulk import
    // For now, it will clear existing data and then add new data one by one
    await clearAllData();
    // @ts-ignore
    for (const transaction of newTransactions) {
      await addTransaction(transaction);
    }
    // @ts-ignore
    for (const goal of newSavingsGoals) {
      await addSavingsGoal(goal);
    }
  };

  const clearAllData = async () => {
    try {
      // Delete all transactions
      // @ts-ignore
      for (const transaction of transactions) {
        await fetch(`${API_BASE_URL}/transactions/\${transaction._id}`, { method: 'DELETE' });
      }
      setTransactions([]);

      // Delete all savings goals
      // @ts-ignore
      for (const goal of savingsGoals) {
        await fetch(`${API_BASE_URL}/goals/\${goal._id}`, { method: 'DELETE' });
      }
      setSavingsGoals([]);
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  };

  return {
    transactions,
    savingsGoals,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updatePaymentStatus,
    addSavingsGoal,
    updateSavingsGoal,
    addSavingsContribution,
    updateSavingsContribution,
    deleteSavingsContribution,
    deleteSavingsGoal,
    importData,
    clearAllData,
  };
};