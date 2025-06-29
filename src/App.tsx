import React, { useState } from 'react';
import { useFinancialData } from './hooks/useFinancialData';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import Reports from './components/Reports';
import SavingsGoals from './components/SavingsGoals';
import Calendar from './components/Calendar';
import Settings from './components/Settings';
import Navigation from './components/Navigation';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const {
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
  } = useFinancialData();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard transactions={transactions} savingsGoals={savingsGoals} />;
      case 'expenses':
        return (
          <TransactionList
            type="expense"
            transactions={transactions}
            onAdd={addTransaction}
            onUpdate={updateTransaction}
            onDelete={deleteTransaction}
            onUpdatePaymentStatus={updatePaymentStatus}
          />
        );
      case 'income':
        return (
          <TransactionList
            type="income"
            transactions={transactions}
            onAdd={addTransaction}
            onUpdate={updateTransaction}
            onDelete={deleteTransaction}
            onUpdatePaymentStatus={updatePaymentStatus}
          />
        );
      case 'calendar':
        return (
          <Calendar
            transactions={transactions}
            onUpdatePaymentStatus={updatePaymentStatus}
          />
        );
      case 'reports':
        return <Reports transactions={transactions} savingsGoals={savingsGoals} />;
      case 'goals':
        return (
          <SavingsGoals
            goals={savingsGoals}
            onAdd={addSavingsGoal}
            onUpdate={updateSavingsGoal}
            onDelete={deleteSavingsGoal}
            onAddContribution={addSavingsContribution}
            onUpdateContribution={updateSavingsContribution}
            onDeleteContribution={deleteSavingsContribution}
          />
        );
      case 'settings':
        return (
          <Settings
            transactions={transactions}
            savingsGoals={savingsGoals}
            onImportData={importData}
            onClearAllData={clearAllData}
          />
        );
      default:
        return <Dashboard transactions={transactions} savingsGoals={savingsGoals} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-center">💰 Controle Financeiro</h1>
          <p className="text-blue-100 text-sm text-center mt-1">
            Rodolfo & Thaís
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 pb-20">
        {renderContent()}
      </main>

      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;