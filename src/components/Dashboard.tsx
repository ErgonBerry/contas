import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction, SavingsGoal, MonthlyBalance } from '../types';
import { formatCurrency, filterTransactionsByMonth, calculateGoalsImpact, getCurrentBrazilDate } from '../utils/helpers';
import { TrendingUp, TrendingDown, Wallet, Target, AlertTriangle, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import Confetti from 'react-confetti';
import useWindowSize from '../hooks/useWindowSize';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTheme } from '../contexts/ThemeContext';

interface DashboardProps {
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  monthlyBalances: MonthlyBalance[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, savingsGoals, monthlyBalances }) => {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(getCurrentBrazilDate());
  const { theme } = useTheme();

  const transactionsForSelectedMonth = filterTransactionsByMonth(transactions, currentMonth);
  
  const currentMonthKey = format(currentMonth, 'yyyy-MM');
  const currentMonthBalanceData = useMemo(() => {
    return monthlyBalances.find(mb => mb.month === currentMonthKey);
  }, [monthlyBalances, currentMonthKey]);

  const currentBalance = currentMonthBalanceData?.balance ?? 0;
  
  const currentIncome = transactionsForSelectedMonth
    .filter(t => t.type === 'income' && t.isPaid)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const currentExpenses = transactionsForSelectedMonth
    .filter(t => t.type === 'expense' && t.isPaid)
    .reduce((sum, t) => sum + t.amount, 0);

  const goalsImpact = calculateGoalsImpact(savingsGoals, currentMonth);
  const adjustedBalance = currentBalance - goalsImpact;

  const totalSavingsGoals = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);

  const previousMonthKey = format(subMonths(currentMonth, 1), 'yyyy-MM');
  const previousMonthBalanceData = useMemo(() => {
    return monthlyBalances.find(mb => mb.month === previousMonthKey);
  }, [monthlyBalances, previousMonthKey]);

  const previousAdjustedBalance = (previousMonthBalanceData?.balance ?? 0) - calculateGoalsImpact(savingsGoals, subMonths(currentMonth, 1));
  const balanceChange = adjustedBalance - previousAdjustedBalance;

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
        <h1 className="text-2xl font-bold text-text mb-2">
          Resumo Financeiro
        </h1>
        <div className="flex items-center justify-center gap-2 text-text">
          <button onClick={handlePreviousMonth} className="p-1 rounded-full hover:bg-cardBorder">
            <ChevronLeft className="w-5 h-5 text-text" />
          </button>
          <p className="text-text">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </p>
          <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-cardBorder">
            <ChevronRight className="w-5 h-5 text-text" />
          </button>
          <button
            onClick={() => handleCardClick('/calendar')}
            className="p-2 rounded-full bg-accent text-text hover:bg-opacity-80 transition-colors shadow-md"
            title="Ir para o Calendário"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Balance */}
      <div 
        className={`rounded-2xl p-6 cursor-pointer transition-all duration-300 ease-in-out ${isPulsing ? 'scale-105 shadow-xl' : 'scale-100 shadow-lg'} ${adjustedBalance < 0 ? 'text-gray-800' : 'text-white'}`}
        style={{ background: adjustedBalance < 0 ? 'linear-gradient(to right, #FFDDC1, #FFB26B)' : `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}
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
          <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                        <p className="text-sm text-gray-800">
              ⚠️ Suas despesas e metas excedem suas receitas este mês
            </p>
          </div>
        )}
      </div>

      {/* IMPROVED: Income vs Expenses vs Goals - Better horizontal layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div 
          className="rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
          style={{ backgroundColor: theme.cardBackground, border: `1px solid ${theme.cardBorder}` }}
          onClick={() => handleCardClick('/income')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
              <h3 className="text-sm font-medium text-text truncate">Receitas</h3>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-text break-words">
            {formatCurrency(currentIncome)}
          </p>
        </div>

        <div 
          className="rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
          style={{ backgroundColor: theme.cardBackground, border: `1px solid ${theme.cardBorder}` }}
          onClick={() => handleCardClick('/expenses')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <TrendingDown className="w-4 h-4 text-primary flex-shrink-0" />
              <h3 className="text-sm font-medium text-text truncate">Gastos Pagos</h3>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-text break-words">
            {formatCurrency(currentExpenses)}
          </p>
          <p className="text-xs text-text mt-1 truncate opacity-80">
            Apenas despesas já pagas
          </p>
        </div>

        <div 
          className="rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
          style={{ backgroundColor: theme.cardBackground, border: `1px solid ${theme.cardBorder}` }}
          onClick={() => handleCardClick('/goals')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <Target className="w-4 h-4 text-primary flex-shrink-0" />
              <h3 className="text-sm font-medium text-text truncate">Metas</h3>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-text break-words">
            {formatCurrency(goalsImpact)}
          </p>
          <p className="text-xs text-text mt-1 truncate opacity-80">
            Aportes realizados no mês
          </p>
        </div>
      </div>

      {/* Savings Goals Summary */}
      {savingsGoals.length > 0 && (
        <div 
          className="rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
          style={{ backgroundColor: theme.cardBackground, border: `1px solid ${theme.cardBorder}` }}
          onClick={() => handleCardClick('/goals')}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-text truncate pr-2">Progresso das Metas</h3>
            <Target className="w-4 h-4 text-primary flex-shrink-0" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text truncate pr-2">Progresso Total</span>
              <span className="font-medium text-text flex-shrink-0 break-words">
                {formatCurrency(totalSaved)} / {formatCurrency(totalSavingsGoals)}
              </span>
            </div>
            <div className="w-full rounded-full h-2" style={{ backgroundColor: theme.cardBorder }}>
              <div 
                className="h-2 rounded-full transition-all duration-500"
                style={{ 
                  backgroundColor: theme.primary,
                  width: `${totalSavingsGoals > 0 ? (totalSaved / totalSavingsGoals) * 100 : 0}%` 
                }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text truncate pr-2 opacity-80">
                {totalSavingsGoals > 0 ? Math.round((totalSaved / totalSavingsGoals) * 100) : 0}% concluído
              </span>
              <span className="text-text flex-shrink-0 opacity-80">
                {goalsImpact > 0 && `${formatCurrency(goalsImpact)} este mês`}
              </span>
            </div>
          </div>
        </div>
      )}

      

      
    </div>
  );
};

export default Dashboard;
