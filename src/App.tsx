import React, { useState } from 'react';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './components/Views/Dashboard';
import { ExpenseList } from './components/Views/ExpenseList';
import { Forecast } from './components/Views/Forecast';
import { Calendar } from './components/Views/Calendar';
import { Settings } from './components/Views/Settings';
import { ExpenseForm } from './components/Expenses/ExpenseForm';
import { useExpenses } from './hooks/useExpenses';
import { Expense } from './types/expense';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState('usuario1');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();

  const {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    toggleExpensePaid,
    getExpenseSummary,
  } = useExpenses();

  const summary = getExpenseSummary();

  const handleAddExpense = () => {
    setEditingExpense(undefined);
    setShowExpenseForm(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleSaveExpense = (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, expenseData);
    } else {
      addExpense(expenseData);
    }
    setShowExpenseForm(false);
    setEditingExpense(undefined);
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta?')) {
      deleteExpense(id);
    }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard summary={summary} />;
      case 'expenses':
        return (
          <ExpenseList
            expenses={expenses}
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
            onTogglePaid={toggleExpensePaid}
          />
        );
      case 'forecast':
        return <Forecast expenses={expenses} />;
      case 'calendar':
        return <Calendar expenses={expenses} />;
      case 'settings':
        return (
          <Settings
            currentUser={currentUser}
            onUserChange={setCurrentUser}
          />
        );
      default:
        return <Dashboard summary={summary} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-tea_green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-taupe_gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        onAddClick={handleAddExpense}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
      />
      
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      
      <main className="max-w-lg mx-auto px-4 py-6">
        {renderActiveView()}
      </main>
      
      {showExpenseForm && (
        <ExpenseForm
          expense={editingExpense}
          onSave={handleSaveExpense}
          onCancel={() => {
            setShowExpenseForm(false);
            setEditingExpense(undefined);
          }}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}

export default App;