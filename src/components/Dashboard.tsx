import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction, SavingsGoal } from '../types';
import { formatCurrency, filterTransactionsByMonth, calculateMonthlyBalance, calculateGoalsImpact, getCurrentBrazilDate, formatBrazilDate, parseLocalDate } from '../utils/helpers';
import { TrendingUp, TrendingDown, Wallet, Target, AlertTriangle, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import Confetti from 'react-confetti';
import useWindowSize from '../hooks/useWindowSize';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardProps {
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, savingsGoals }) => {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(getCurrentBrazilDate());

  const transactionsForSelectedMonth = filterTransactionsByMonth(transactions, currentMonth);
  
  const currentBalance = calculateMonthlyBalance(transactions, currentMonth);
  
  const currentIncome = transactionsForSelectedMonth
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const currentExpenses = transactionsForSelectedMonth
    .filter(t => t.type === 'expense' && t.isPaid)
    .reduce((sum, t) => sum + t.amount, 0);

  const goalsImpact = calculateGoalsImpact(savingsGoals, currentMonth);
  const adjustedBalance = currentBalance - goalsImpact;

  const totalSavingsGoals = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);

  const previousDate = subMonths(currentMonth, 1);
  const previousBalance = calculateMonthlyBalance(transactions, previousDate);
  const previousGoalsImpact = calculateGoalsImpact(savingsGoals, previousDate);
  const previousAdjustedBalance = previousBalance - previousGoalsImpact;
  const balanceChange = adjustedBalance - previousAdjustedBalance;

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

  const handleBalanceCardClick = () => {
    setShowConfetti(true);
    setIsPulsing(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000); // Confetti for 3 seconds
    setTimeout(() => {
      setIsPulsing(false);
    }, 300); // Pulse for 300ms
  };

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

  const confettiColors = adjustedBalance < 0 
    ? ['#FFD700', '#DAA520', '#B8860B', '#8B4513'] // Gold, Goldenrod, DarkGoldenrod, SaddleBrown (money-like colors)
    : ['#a8e063', '#56ab2f', '#4CAF50', '#8BC34A']; // Green shades

  return (
    <div className="space-y-6">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={adjustedBalance < 0 ? 300 : 200} colors={confettiColors} />}
      <div className="text-center py-3">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Resumo Financeiro
        </h1>
        <div className="flex items-center justify-center gap-2 text-slate-600">
          <button onClick={handlePreviousMonth} className="p-1 rounded-full hover:bg-slate-100">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <p className="text-slate-600">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </p>
          <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-slate-100">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
          <button
            onClick={() => handleCardClick('/calendar')}
            className="p-2 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors shadow-md"
            title="Ir para o Calendário"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Balance */}
      <div 
        className={`${getBalanceCardStyle()} rounded-2xl p-6 text-white cursor-pointer transition-all duration-300 ease-in-out ${isPulsing ? 'scale-105 shadow-xl' : 'scale-100 shadow-lg'}`}
        onClick={handleBalanceCardClick}
      >
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
        <div 
          className="bg-green-50 border border-green-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => handleCardClick('/income')}
        >
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

        <div 
          className="bg-red-50 border border-red-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => handleCardClick('/expenses')}
        >
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

        <div 
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => handleCardClick('/goals')}
        >
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
        <div 
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => handleCardClick('/goals')}
        >
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

      {/* Recent Transactions - NOT CLICKABLE */}
      {transactionsForSelectedMonth.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">
            Transações Recentes
          </h3>
          <div className="space-y-3">
            {transactionsForSelectedMonth.slice(0, 5).map((transaction) => (
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
          <p><strong>Total transações do mês:</strong> {transactionsForSelectedMonth.length}</p>
          <p><strong>Transações recorrentes:</strong> {transactionsForSelectedMonth.filter(t => t.id.includes('_') || t.recurrence !== 'none').length}</p>
          <p><strong>Despesas pagas (recorrentes):</strong> {transactionsForSelectedMonth.filter(t => (t.id.includes('_') || t.recurrence !== 'none') && t.type === 'expense' && t.isPaid).length}</p>
          <p><strong>Despesas pendentes (recorrentes):</strong> {transactionsForSelectedMonth.filter(t => (t.id.includes('_') || t.recurrence !== 'none') && t.type === 'expense' && !t.isPaid).length}</p>
          <p><strong>Receitas:</strong> {formatCurrency(currentIncome)}</p>
          <p><strong>Despesas pagas:</strong> {formatCurrency(currentExpenses)}</p>
          <p><strong>Saldo final:</strong> {formatCurrency(adjustedBalance)}</p>
          {transactionsForSelectedMonth.filter(t => t.id.includes('_') || t.recurrence !== 'none').length > 0 && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
              <p className="font-semibold text-blue-800 mb-1">Detalhes das Recorrentes:</p>
              {transactionsForSelectedMonth.filter(t => t.id.includes('_') || t.recurrence !== 'none').slice(0, 3).map(t => (
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
