import React from 'react';
import { Transaction, SavingsGoal } from '../types';
import { formatCurrency, filterTransactionsByMonth, calculateMonthlyBalance, calculateGoalsImpact, getCurrentBrazilDate, formatBrazilDate, parseLocalDate } from '../utils/helpers';
import { TrendingUp, TrendingDown, Wallet, Target, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, savingsGoals }) => {
  const currentDate = getCurrentBrazilDate();
  const currentMonthTransactions = filterTransactionsByMonth(transactions, currentDate);
  
  // FIXED: Pass the current date to calculateMonthlyBalance to ensure recurring transactions are included
  const currentBalance = calculateMonthlyBalance(transactions, currentDate);
  
  const currentIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // FIXED: Calculate expenses - ONLY count paid expenses (regardless of due date)
  const currentExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense' && t.isPaid)
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate goals impact for current month
  const goalsImpact = calculateGoalsImpact(savingsGoals, currentDate);
  const adjustedBalance = currentBalance - goalsImpact;

  const totalSavingsGoals = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);

  // Previous month comparison
  const previousDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const previousBalance = calculateMonthlyBalance(transactions, previousDate);
  const previousGoalsImpact = calculateGoalsImpact(savingsGoals, previousDate);
  const previousAdjustedBalance = previousBalance - previousGoalsImpact;
  const balanceChange = adjustedBalance - previousAdjustedBalance;

  // Determine balance card color
  const getBalanceCardStyle = () => {
    if (adjustedBalance < 0) {
      return 'bg-gradient-to-r from-orange-500 to-orange-600';
    }
    return 'bg-gradient-to-r from-blue-500 to-blue-600';
  };

  const getBalanceIcon = () => {
    if (adjustedBalance < 0) {
      return <AlertTriangle className="w-6 h-6 opacity-90" />;
    }
    return <Wallet className="w-6 h-6 opacity-90" />;
  };

  // ENHANCED DEBUG: More detailed logging for recurring transactions
  const recurringTransactions = currentMonthTransactions.filter(t => t.id.includes('_') || t.recurrence !== 'none');
  const paidRecurringExpenses = recurringTransactions.filter(t => t.type === 'expense' && t.isPaid);
  const unpaidRecurringExpenses = recurringTransactions.filter(t => t.type === 'expense' && !t.isPaid);

  console.log('🔍 ENHANCED DEBUG Dashboard:', {
    currentMonthTransactions: currentMonthTransactions.length,
    recurringTransactions: recurringTransactions.length,
    currentBalance,
    currentIncome,
    currentExpenses,
    goalsImpact,
    adjustedBalance,
    paidExpenses: currentMonthTransactions.filter(t => t.type === 'expense' && t.isPaid).length,
    unpaidExpenses: currentMonthTransactions.filter(t => t.type === 'expense' && !t.isPaid).length,
    paidRecurringExpenses: paidRecurringExpenses.length,
    unpaidRecurringExpenses: unpaidRecurringExpenses.length,
    recurringTransactionDetails: recurringTransactions.map(t => ({
      id: t.id,
      description: t.description,
      amount: t.amount,
      isPaid: t.isPaid,
      recurrence: t.recurrence,
      type: t.type
    }))
  });

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Resumo Financeiro
        </h1>
        <p className="text-slate-600">
          {formatBrazilDate(currentDate, 'MMMM yyyy')}
        </p>
      </div>

      {/* Main Balance */}
      <div className={`${getBalanceCardStyle()} rounded-2xl p-6 text-white`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium opacity-90 truncate pr-2">
            {adjustedBalance < 0 ? 'Déficit do Mês' : 'Saldo do Mês'}
          </h2>
          {getBalanceIcon()}
        </div>
        <div className="flex items-end justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-2xl sm:text-3xl font-bold mb-1 break-words">
              {formatCurrency(adjustedBalance)}
            </p>
            {goalsImpact > 0 && (
              <p className="text-sm opacity-80 mb-2 break-words">
                Saldo bruto: {formatCurrency(currentBalance)}
              </p>
            )}
            {balanceChange !== 0 && (
              <div className="flex items-center space-x-1">
                {balanceChange > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-300 flex-shrink-0" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-300 flex-shrink-0" />
                )}
                <span className="text-sm opacity-90 break-words">
                  {formatCurrency(Math.abs(balanceChange))} vs mês anterior
                </span>
              </div>
            )}
          </div>
        </div>
        {adjustedBalance < 0 && (
          <div className="mt-3 p-3 bg-white bg-opacity-20 rounded-lg">
            <p className="text-sm opacity-90">
              ⚠️ Suas despesas e metas excedem suas receitas este mês
            </p>
          </div>
        )}
      </div>

      {/* IMPROVED: Income vs Expenses vs Goals - Better horizontal layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
              <h3 className="text-sm font-medium text-green-800 truncate">Receitas</h3>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-green-900 break-words">
            {formatCurrency(currentIncome)}
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <TrendingDown className="w-4 h-4 text-red-600 flex-shrink-0" />
              <h3 className="text-sm font-medium text-red-800 truncate">Gastos Pagos</h3>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-red-900 break-words">
            {formatCurrency(currentExpenses)}
          </p>
          <p className="text-xs text-red-700 mt-1 truncate">
            Apenas despesas já pagas
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <Target className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <h3 className="text-sm font-medium text-amber-800 truncate">Metas</h3>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-amber-900 break-words">
            {formatCurrency(goalsImpact)}
          </p>
          <p className="text-xs text-amber-700 mt-1 truncate">
            Aportes realizados no mês
          </p>
        </div>
      </div>

      {/* Savings Goals Summary */}
      {savingsGoals.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-amber-800 truncate pr-2">Progresso das Metas</h3>
            <Target className="w-4 h-4 text-amber-600 flex-shrink-0" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-amber-800 truncate pr-2">Progresso Total</span>
              <span className="font-medium text-amber-900 flex-shrink-0 break-words">
                {formatCurrency(totalSaved)} / {formatCurrency(totalSavingsGoals)}
              </span>
            </div>
            <div className="w-full bg-amber-200 rounded-full h-2">
              <div 
                className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${totalSavingsGoals > 0 ? (totalSaved / totalSavingsGoals) * 100 : 0}%` 
                }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-amber-700 truncate pr-2">
                {totalSavingsGoals > 0 ? Math.round((totalSaved / totalSavingsGoals) * 100) : 0}% concluído
              </span>
              <span className="text-amber-700 flex-shrink-0">
                {goalsImpact > 0 && `${formatCurrency(goalsImpact)} este mês`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {currentMonthTransactions.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">
            Transações Recentes
          </h3>
          <div className="space-y-3">
            {currentMonthTransactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-2 gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">
                    {transaction.description}
                    {(transaction.id.includes('_') || transaction.recurrence !== 'none') && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        Recorrente
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 break-words">
                    <span className="truncate">
                      {transaction.category}
                    </span>
                    {' • '}
                    <span className="whitespace-nowrap">
                      {transaction.type === 'income' 
                        ? formatBrazilDate(parseLocalDate(transaction.date))
                        : transaction.dueDate 
                        ? `Vence: ${formatBrazilDate(parseLocalDate(transaction.dueDate))}`
                        : 'Sem vencimento'
                      }
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <p className={`font-semibold text-sm sm:text-base break-words ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  {transaction.type === 'expense' && (
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      transaction.isPaid ? 'bg-green-500' : 'bg-orange-500'
                    }`} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ENHANCED DEBUG INFO */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-xs">
        <h4 className="font-semibold text-green-800 mb-2">🔧 DEBUG - Transações Recorrentes</h4>
        <div className="space-y-1 text-green-700">
          <p><strong>Total transações do mês:</strong> {currentMonthTransactions.length}</p>
          <p><strong>Transações recorrentes:</strong> {recurringTransactions.length}</p>
          <p><strong>Despesas pagas (recorrentes):</strong> {paidRecurringExpenses.length}</p>
          <p><strong>Despesas pendentes (recorrentes):</strong> {unpaidRecurringExpenses.length}</p>
          <p><strong>Receitas:</strong> {formatCurrency(currentIncome)}</p>
          <p><strong>Despesas pagas:</strong> {formatCurrency(currentExpenses)}</p>
          <p><strong>Saldo final:</strong> {formatCurrency(adjustedBalance)}</p>
          {recurringTransactions.length > 0 && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
              <p className="font-semibold text-blue-800 mb-1">Detalhes das Recorrentes:</p>
              {recurringTransactions.slice(0, 3).map(t => (
                <p key={t.id} className="text-blue-700 text-xs">
                  • {t.description}: {formatCurrency(t.amount)} ({t.isPaid ? 'Pago' : 'Pendente'})
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;