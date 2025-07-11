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
import { useTheme } from './contexts/ThemeContext';
import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import ShoppingCartButton from './components/ShoppingCartButton';
import ShoppingListModal from './components/ShoppingListModal';
import { useShoppingList } from './hooks/useShoppingList';

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
    monthlyBalances,
  } = useFinancialData();

  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
  const { shoppingList, addItem, togglePurchased, removeItem, clearPurchased } = useShoppingList();

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.background }}>
        <Header />
        <Navigation />

        <button
          onClick={toggleTheme}
          className="fixed top-20 right-4 z-50 p-2 rounded-full bg-card-background text-text shadow-lg"
          style={{ 
            backgroundColor: theme.cardBackground,
            color: theme.text
          }}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <ShoppingCartButton
          itemCount={Array.isArray(shoppingList) ? shoppingList.filter(item => !item.purchased).length : 0}
          onClick={() => setIsShoppingListOpen(true)}
          theme={theme}
        />

        <ShoppingListModal
          isOpen={isShoppingListOpen}
          onClose={() => setIsShoppingListOpen(false)}
          shoppingList={shoppingList}
          addItem={addItem}
          togglePurchased={togglePurchased}
          removeItem={removeItem}
          clearPurchased={clearPurchased}
          theme={theme}
        />

        <main className="max-w-md mx-auto p-4 pb-20">
          <Routes>
            <Route path="/" element={<Dashboard transactions={transactions} savingsGoals={savingsGoals} monthlyBalances={monthlyBalances} />} />
            <Route path="/expenses" element={<TransactionList type="expense" transactions={transactions} onAdd={addTransaction} onUpdate={updateTransaction} onDelete={deleteTransaction} onUpdatePaymentStatus={updatePaymentStatus} monthlyBalances={monthlyBalances} />} />
            <Route path="/income" element={<TransactionList type="income" transactions={transactions} onAdd={addTransaction} onUpdate={updateTransaction} onDelete={deleteTransaction} onUpdatePaymentStatus={updatePaymentStatus} monthlyBalances={monthlyBalances} />} />
            <Route path="/calendar" element={<Calendar transactions={transactions} onUpdatePaymentStatus={updatePaymentStatus} />} />
            <Route path="/reports" element={<Reports transactions={transactions} savingsGoals={savingsGoals} />} />
            <Route path="/goals" element={<SavingsGoals goals={savingsGoals} onAdd={addSavingsGoal} onUpdate={updateSavingsGoal} onDelete={deleteSavingsGoal} onAddContribution={addSavingsContribution} onUpdateContribution={updateSavingsContribution} onDeleteContribution={deleteSavingsContribution} />} />
            <Route path="/settings" element={<Settings transactions={transactions} savingsGoals={savingsGoals} onImportData={importData} onClearAllData={clearAllData} />} />
          </Routes>
        </main>
    </div>
  );
}

export default App;