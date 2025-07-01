import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useFinancialData } from './hooks/useFinancialData';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import Reports from './components/Reports';
import SavingsGoals from './components/SavingsGoals';
import Calendar from './components/Calendar';
import Settings from './components/Settings';
import Navigation from './components/Navigation';
import Header from './components/Header';
import { PanelLeft, PanelBottom } from 'lucide-react';

function App() {
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
  const [menuPosition, setMenuPosition] = useState<'bottom' | 'side'>('bottom');

  const toggleMenuPosition = () => {
    setMenuPosition(prev => prev === 'bottom' ? 'side' : 'bottom');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className={`max-w-md mx-auto p-4 pb-20 transition-all duration-300 ease-in-out ${menuPosition === 'side' ? 'ml-48' : ''}`}>
        <Routes>
          <Route path="/" element={<Dashboard transactions={transactions} savingsGoals={savingsGoals} />} />
          <Route path="/expenses" element={<TransactionList type="expense" transactions={transactions} onAdd={addTransaction} onUpdate={updateTransaction} onDelete={deleteTransaction} onUpdatePaymentStatus={updatePaymentStatus} />} />
          <Route path="/income" element={<TransactionList type="income" transactions={transactions} onAdd={addTransaction} onUpdate={updateTransaction} onDelete={deleteTransaction} onUpdatePaymentStatus={updatePaymentStatus} />} />
          <Route path="/calendar" element={<Calendar transactions={transactions} onUpdatePaymentStatus={updatePaymentStatus} />} />
          <Route path="/reports" element={<Reports transactions={transactions} savingsGoals={savingsGoals} />} />
          <Route path="/goals" element={<SavingsGoals goals={savingsGoals} onAdd={addSavingsGoal} onUpdate={updateSavingsGoal} onDelete={deleteSavingsGoal} onAddContribution={addSavingsContribution} onUpdateContribution={updateSavingsContribution} onDeleteContribution={deleteSavingsContribution} />} />
          <Route path="/settings" element={<Settings transactions={transactions} savingsGoals={savingsGoals} onImportData={importData} onClearAllData={clearAllData} />} />
        </Routes>
      </main>

      <Navigation menuPosition={menuPosition} />

      <button
        onClick={toggleMenuPosition}
        className={`fixed right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all duration-300 ease-in-out z-50 ${
          menuPosition === 'bottom' ? 'bottom-20' : 'bottom-4'
        }`}
        aria-label="Mover menu"
      >
        {menuPosition === 'bottom' ? <PanelLeft size={20} /> : <PanelBottom size={20} />}
      </button>
    </div>
  );
}

export default App;