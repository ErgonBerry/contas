import { useState, useEffect } from 'react';
import { Transaction, SavingsGoal, SavingsContribution } from '../types';
import { generateId, getCurrentBrazilDate, getBrazilDateString } from '../utils/helpers';

const TRANSACTIONS_KEY = 'financial_transactions';
const GOALS_KEY = 'savings_goals';

export const useFinancialData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem(TRANSACTIONS_KEY);
    const savedGoals = localStorage.getItem(GOALS_KEY);

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    if (savedGoals) {
      const goals = JSON.parse(savedGoals);
      // Migrate old format to new format with contributions
      const migratedGoals = goals.map((goal: any) => {
        if (!goal.contributions) {
          goal.contributions = [];
          // If there's a currentAmount but no contributions, create a single contribution
          if (goal.currentAmount > 0) {
            goal.contributions.push({
              id: generateId(),
              amount: goal.currentAmount,
              date: getBrazilDateString(), // Use current date as fallback
              createdAt: getCurrentBrazilDate().toISOString(),
            });
          }
        }
        return goal;
      });
      setSavingsGoals(migratedGoals);
    }
  }, []);

  // Save transactions to localStorage
  useEffect(() => {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  }, [transactions]);

  // Save goals to localStorage
  useEffect(() => {
    localStorage.setItem(GOALS_KEY, JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
      createdAt: getCurrentBrazilDate().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(transaction => 
      transaction.id === id ? { ...transaction, ...updates } : transaction
    ));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const updatePaymentStatus = (id: string, isPaid: boolean) => {
    // For recurring transactions, we need to handle them specially
    if (id.includes('_')) {
      // This is a recurring transaction instance
      const originalId = id.split('_')[0];
      const timestamp = id.split('_')[1];
      
      // Find the original transaction
      const originalTransaction = transactions.find(t => t.id === originalId);
      if (!originalTransaction || originalTransaction.recurrence === 'none') {
        return; // Safety check
      }
      
      // Create a new one-time transaction for this specific payment
      const specificTransaction: Transaction = {
        ...originalTransaction,
        id: generateId(),
        recurrence: 'none', // Make it non-recurring
        isPaid: isPaid,
        createdAt: getCurrentBrazilDate().toISOString(),
      };
      
      // Add the specific transaction
      setTransactions(prev => [specificTransaction, ...prev]);
    } else {
      // Regular transaction - just update payment status
      setTransactions(prev => prev.map(transaction => {
        if (transaction.id === id) {
          return { ...transaction, isPaid };
        }
        return transaction;
      }));
    }
  };

  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: generateId(),
      createdAt: getCurrentBrazilDate().toISOString(),
      contributions: [], // Initialize with empty contributions array
    };
    setSavingsGoals(prev => [newGoal, ...prev]);
  };

  const updateSavingsGoal = (id: string, updates: Partial<SavingsGoal>) => {
    setSavingsGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, ...updates } : goal
    ));
  };

  const addSavingsContribution = (goalId: string, amount: number, date?: string) => {
    const contribution: SavingsContribution = {
      id: generateId(),
      amount,
      date: date || getBrazilDateString(),
      createdAt: getCurrentBrazilDate().toISOString(),
    };

    setSavingsGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const newContributions = [...(goal.contributions || []), contribution];
        const newCurrentAmount = newContributions.reduce((sum, c) => sum + c.amount, 0);
        
        return {
          ...goal,
          contributions: newContributions,
          currentAmount: newCurrentAmount,
        };
      }
      return goal;
    }));
  };

  const updateSavingsContribution = (goalId: string, contributionId: string, updates: Partial<SavingsContribution>) => {
    setSavingsGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const updatedContributions = goal.contributions.map(contribution =>
          contribution.id === contributionId ? { ...contribution, ...updates } : contribution
        );
        const newCurrentAmount = updatedContributions.reduce((sum, c) => sum + c.amount, 0);
        
        return {
          ...goal,
          contributions: updatedContributions,
          currentAmount: newCurrentAmount,
        };
      }
      return goal;
    }));
  };

  const deleteSavingsContribution = (goalId: string, contributionId: string) => {
    setSavingsGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const filteredContributions = goal.contributions.filter(c => c.id !== contributionId);
        const newCurrentAmount = filteredContributions.reduce((sum, c) => sum + c.amount, 0);
        
        return {
          ...goal,
          contributions: filteredContributions,
          currentAmount: newCurrentAmount,
        };
      }
      return goal;
    }));
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals(prev => prev.filter(g => g.id !== id));
  };

  const importData = (newTransactions: Transaction[], newSavingsGoals: SavingsGoal[]) => {
    // Replace all data with imported data
    setTransactions(newTransactions);
    setSavingsGoals(newSavingsGoals);
  };

  const clearAllData = () => {
    setTransactions([]);
    setSavingsGoals([]);
    localStorage.removeItem(TRANSACTIONS_KEY);
    localStorage.removeItem(GOALS_KEY);
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