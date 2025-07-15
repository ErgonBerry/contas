import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { formatCurrency, isTransactionOverdue, getDaysUntilDue, formatBrazilDate, getCurrentBrazilDate, filterTransactionsByMonth, parseLocalDate } from '../utils/helpers';
import { Plus, Trash2, Filter, Check, Calendar, CreditCard, Clock, Edit3, ChevronLeft, ChevronRight } from 'lucide-react';
import TransactionForm from './TransactionForm';
import ConfirmationModal from './ConfirmationModal';
import DailyDateSlider from './DailyDateSlider';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTheme } from '../contexts/ThemeContext';

import { MonthlyBalance } from '../types';

interface TransactionListProps {
  type: 'expense' | 'income';
  transactions: Transaction[];
  monthlyBalances: MonthlyBalance[];
  onAdd: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<Transaction>;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
  onUpdatePaymentStatus: (id: string, isPaid: boolean) => void;
  searchTerm?: string; // Make optional for income
  onSearchChange?: (term: string) => void; // Make optional for income
}

const TransactionList: React.FC<TransactionListProps> = ({
  type,
  transactions,
  monthlyBalances,
  onAdd,
  onUpdate,
  onDelete,
  onUpdatePaymentStatus,
  searchTerm,
  onSearchChange
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionToReplicate, setTransactionToReplicate] = useState<Transaction | null>(null);
  const pressTimer = React.useRef<NodeJS.Timeout | null>(null);
  const countdownTimer = React.useRef<NodeJS.Timeout | null>(null);
  const longPressTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [activeTransactionId, setActiveTransactionId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string[]>(['all']);
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [currentMonth, setCurrentMonth] = useState<Date>(getCurrentBrazilDate());
  const [startDateFilter, setStartDateFilter] = useState<Date | null>(null);
  const [endDateFilter, setEndDateFilter] = useState<Date | null>(null);
  const [isDailyFilterActive, setIsDailyFilterActive] = useState(false);
  const [animatedTransactionId, setAnimatedTransactionId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setCategoryFilter(['all']);
    setPaymentFilter('all'); // Reset payment filter when type changes
    // Reset daily filters when month or type changes
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    setStartDateFilter(start);
    setEndDateFilter(end);
  }, [type, currentMonth]);

  // Effect to trigger animation when search term changes
  useEffect(() => {
    if (searchTerm !== undefined) { // Only trigger if searchTerm is a controlled prop
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 300); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  const handleCategoryFilterChange = (category: string) => {
    if (category === 'all') {
      setCategoryFilter(['all']);
    } else {
      setCategoryFilter(prev => {
        if (prev.includes('all')) {
          return [category];
        } else if (prev.includes(category)) {
          const newFilter = prev.filter(c => c !== category);
          return newFilter.length === 0 ? ['all'] : newFilter;
        } else {
          return [...prev, category];
        }
      });
    }
  };

  useEffect(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    if (startDateFilter && endDateFilter && (!isSameDay(startDateFilter, start) || !isSameDay(endDateFilter, end))) {
      setIsDailyFilterActive(true);
    } else {
      setIsDailyFilterActive(false);
    }
  }, [startDateFilter, endDateFilter, currentMonth]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  
  const filteredTransactions = transactions
    .filter(t => t.type === type)
    .filter(t => categoryFilter.includes('all') || categoryFilter.includes(t.category))
    .filter(t => {
      if (paymentFilter === 'all') return true;
      if (paymentFilter === 'paid') return t.isPaid;
      if (paymentFilter === 'pending') return !t.isPaid;
      return true;
    });

  const categories = [...new Set(transactions.filter(t => t.type === type).map(t => t.category))];
  
  // Filter transactions by the current month
  let transactionsForDisplay = filterTransactionsByMonth(filteredTransactions, currentMonth);

  // Apply daily filter if filters are set
  if (startDateFilter && endDateFilter) {
    transactionsForDisplay = transactionsForDisplay.filter(t => {
      const transactionDate = parseLocalDate(t.date);
      return transactionDate >= startDateFilter && transactionDate <= endDateFilter;
    });
  }

  // Sort expenses by due date
  const sortedTransactions = type === 'expense'
    ? [...transactionsForDisplay].sort((a, b) => {
        const dateA = a.dueDate ? parseLocalDate(a.dueDate) : new Date(8640000000000000); // Max Date
        const dateB = b.dueDate ? parseLocalDate(b.dueDate) : new Date(8640000000000000); // Max Date
        return dateA.getTime() - dateB.getTime();
      })
    : transactionsForDisplay;

  const total = sortedTransactions.reduce((sum, t) => sum + t.amount, 0);

  const currentMonthKey = format(currentMonth, 'yyyy-MM');
  const currentMonthBalanceData = monthlyBalances.find(mb => mb.month === currentMonthKey);
  const remainingFromPreviousMonth = currentMonthBalanceData?.remainingBalanceFromPreviousMonth ?? 0;

  const totalIncomeWithRemaining = total + remainingFromPreviousMonth;

  const paidTotal = sortedTransactions.filter(t => t.isPaid).reduce((sum, t) => sum + t.amount, 0);
  const pendingTotal = sortedTransactions.filter(t => !t.isPaid).reduce((sum, t) => sum + t.amount, 0);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
    setTransactionToReplicate(null);
  };

  const handleSubmit = async (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (editingTransaction) {
      await onUpdate(editingTransaction.id, transactionData);
    } else {
      const newTransaction = await onAdd(transactionData);
      // Trigger animation for newly added transaction
      if (newTransaction && newTransaction.id) {
        setAnimatedTransactionId(newTransaction.id);
      }
    }
    handleCloseForm();
  };

  const openDeleteModal = (id: string) => {
    setTransactionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setTransactionToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (transactionToDelete) {
      onDelete(transactionToDelete);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

  const handleDailyFilterChange = (newStartDate: Date, newEndDate: Date) => {
    setStartDateFilter(newStartDate);
    setEndDateFilter(newEndDate);
  };

  const handleClearDailyFilter = () => {
    setStartDateFilter(startOfMonth(currentMonth));
    setEndDateFilter(endOfMonth(currentMonth));
  };

  const handlePressStart = (e: React.MouseEvent | React.TouchEvent, transaction: Transaction) => {
    // If the event target is a button or an element inside a button, do not initiate long press logic
    if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).closest('button')) {
      return;
    }

    // Clear any existing long press timeout to prevent multiple triggers
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }

    // Set a timeout to initiate the long press after a delay
    longPressTimeoutRef.current = setTimeout(() => {
      // Prevent default only when long press is confirmed
      if ('button' in e) { // Check if it's a MouseEvent
        e.preventDefault();
      } else { // It's a TouchEvent
        e.preventDefault(); // Prevent default touch behavior (like scrolling, zooming)
        e.stopPropagation(); // Stop event propagation to prevent text selection on some devices
      }

      setActiveTransactionId(transaction.id);
      setCountdown(3);

      countdownTimer.current = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            if (countdownTimer.current) {
              clearInterval(countdownTimer.current);
              countdownTimer.current = null;
            }
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      pressTimer.current = setTimeout(() => {
        if (countdownTimer.current) { // Ensure countdown completed naturally
          clearInterval(countdownTimer.current);
          countdownTimer.current = null;
        }
        setTransactionToReplicate(transaction);
        setShowForm(true);
        setCountdown(null); // Reset countdown after action
        setActiveTransactionId(null); // Reset active transaction
      }, 3000); // 3000ms for long press
    }, 500); // 500ms delay for long press
  };

  const handlePressEnd = () => {
    if (longPressTimeoutRef.current) { // Clear the initial long press timeout
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    if (countdownTimer.current) {
      clearInterval(countdownTimer.current);
      countdownTimer.current = null;
    }
    setCountdown(null);
    setActiveTransactionId(null);
  };

  // Effect to trigger animation when a transaction is updated (e.g., payment status)
  useEffect(() => {
    if (animatedTransactionId) {
      const timer = setTimeout(() => {
        setAnimatedTransactionId(null);
      }, 1000); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [animatedTransactionId]);

  const handleUpdatePaymentStatusAndAnimate = async (id: string, isPaid: boolean) => {
    await onUpdatePaymentStatus(id, isPaid);
    setAnimatedTransactionId(id);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <button onClick={handlePreviousMonth} className="p-1 rounded-full hover:bg-cardBorder">
              <ChevronLeft className="w-5 h-5 text-text" />
            </button>
            <h2 className="text-xl font-semibold text-text truncate">
              {type === 'expense' ? 'Despesas' : 'Receitas'} - {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-cardBorder">
              <ChevronRight className="w-5 h-5 text-text" />
            </button>
          </div>
          <div className="text-sm text-text space-y-1">
            {type === 'income' ? (
              <>
                <p className="truncate">Remanescente Mês Anterior: <span className="font-medium text-primary">{formatCurrency(remainingFromPreviousMonth)}</span></p>
                <p className="truncate">Total Receitas Mês Atual: <span className="font-medium text-primary">{formatCurrency(total)}</span></p>
                <p className="truncate">Total Geral (c/ remanescente): <span className="font-medium text-primary">{formatCurrency(totalIncomeWithRemaining)}</span></p>
              </>
            ) : (
              <>
                <p className="truncate">Total: <span className="font-medium text-primary">{formatCurrency(total)}</span></p>
                <p className="truncate">Pago: <span className="font-medium text-primary">{formatCurrency(paidTotal)}</span></p>
                <p className="truncate">Pendente: <span className="font-medium text-accent">{formatCurrency(pendingTotal)}</span></p>
              </>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className={`p-3 rounded-full text-white shadow-lg transition-all hover:scale-105 flex-shrink-0 bg-primary hover:bg-secondary`}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-4 h-4 text-text opacity-70 flex-shrink-0" />
            <button
              onClick={() => handleCategoryFilterChange('all')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                categoryFilter.includes('all') 
                  ? 'bg-primary text-white' 
                  : 'bg-cardBackground text-text hover:bg-cardBorder'
              }`}
            >
              Todas
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryFilterChange(category)}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                  categoryFilter.includes(category) && !categoryFilter.includes('all')
                    ? 'bg-primary text-white' 
                    : 'bg-cardBackground text-text hover:bg-cardBorder'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Payment Status Filter (only for expenses) */}
        {type === 'expense' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <CreditCard className="w-4 h-4 text-text opacity-70 flex-shrink-0" />
            <button
              onClick={() => setPaymentFilter('all')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                paymentFilter === 'all' 
                  ? 'bg-primary text-white' 
                  : 'bg-cardBackground text-text hover:bg-cardBorder'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setPaymentFilter('paid')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                paymentFilter === 'paid' 
                  ? 'bg-primary text-white' 
                  : 'bg-cardBackground text-text hover:bg-cardBorder'
              }`}
            >
              Pagos
            </button>
            <button
              onClick={() => setPaymentFilter('pending')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                paymentFilter === 'pending' 
                  ? 'bg-accent text-white' 
                  : 'bg-cardBackground text-text hover:bg-cardBorder'
              }`}
            >
              Pendentes
            </button>
          </div>
        )}

        {/* Search Input (only for expenses) */}
        {type === 'expense' && onSearchChange && (
          <div className="relative flex items-center w-full">
            <input
              type="text"
              placeholder="Buscar despesas..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1 p-2 pl-10 rounded-lg bg-cardBackground text-text border border-cardBorder focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              style={{ paddingRight: '2.5rem' }} // Adjust padding for icon
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search absolute left-3 text-text opacity-70"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
        )}

        {/* Daily Filter for Income/Expense */}
        {startDateFilter && endDateFilter && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <Calendar className="w-4 h-4 text-text opacity-70 flex-shrink-0" />
            <DailyDateSlider
              currentMonth={currentMonth}
              startDate={startDateFilter}
              endDate={endDateFilter}
              onChange={handleDailyFilterChange}
            />
            <button
              onClick={handleClearDailyFilter}
              className={`px-3 py-1 rounded-full bg-cardBorder text-text text-sm whitespace-nowrap transition-colors select-none ${
                isDailyFilterActive ? 'hover:bg-cardBackground' : 'opacity-50 cursor-not-allowed'
              }`}
              disabled={!isDailyFilterActive}
            >
              Limpar
            </button>
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className={`space-y-3 ${isSearching ? 'opacity-0 transition-opacity duration-300' : 'opacity-100 transition-opacity duration-300'}`}>
        {sortedTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.cardBorder }}>
              <Plus className="w-8 h-8 text-text opacity-70" />
            </div>
            <p className="text-text mb-4 opacity-90">
              Nenhuma {type === 'expense' ? 'despesa' : 'receita'} registrada para este mês.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className={`px-6 py-3 rounded-xl text-white font-medium transition-colors bg-primary hover:bg-secondary`}
            >
              Adicionar {type === 'expense' ? 'Despesa' : 'Receita'}
            </button>
          </div>
        ) : (
          sortedTransactions.map((transaction, index) => {
            const overdue = isTransactionOverdue(transaction);
            const daysUntilDue = transaction.dueDate ? getDaysUntilDue(transaction.dueDate) : null;
            
            return (
              <div
                key={`${transaction.id}-${index}`}
                className={`relative border rounded-xl p-4 hover:shadow-md transition-shadow no-select ${animatedTransactionId === transaction.id ? 'animate-pulse-once' : ''}`}
                style={{ 
                  backgroundColor: theme.cardBackground,
                  borderColor: overdue ? theme.primary : (!transaction.isPaid && type === 'expense' ? theme.accent : theme.cardBorder)
                }}
                onMouseDown={(e) => handlePressStart(e, transaction)}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
                onTouchStart={(e) => handlePressStart(e, transaction)}
                onTouchEnd={handlePressEnd}
                onTouchCancel={handlePressEnd}
                onTouchMove={handlePressEnd} // Added this line
              >
                {activeTransactionId === transaction.id && countdown !== null && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-xl z-10">
                    <span className="text-white text-4xl font-bold">{countdown}</span>
                  </div>
                )}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-text truncate">
                        {transaction.description}
                      </h3>
                      <button
                        onClick={() => handleUpdatePaymentStatusAndAnimate(transaction.id, !transaction.isPaid)}
                        className={`p-1 rounded-full transition-colors flex-shrink-0 ${
                          transaction.isPaid 
                            ? 'bg-[#D4EDDA]' 
                            : 'bg-[#FFE0B2]'
                        }`}
                      >
                        {transaction.isPaid ? <Check className="w-4 h-4 text-black" /> : <Clock className="w-4 h-4 text-black" />}
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-sm text-text opacity-90 mb-2">
                      <span className="px-2 py-1 rounded-full truncate max-w-[120px]" style={{ backgroundColor: theme.cardBorder }}>
                        {transaction.category}
                      </span>
                      
                      {/* Data da transação */}
                      <span className="whitespace-nowrap">{formatBrazilDate(transaction.date)}</span>
                      
                      {transaction.recurrence !== 'none' && (
                        <span className="px-2 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: theme.primary, color: 'white' }}>
                          {transaction.recurrence === 'weekly' && 'Semanal'}
                          {transaction.recurrence === 'monthly' && 'Mensal'}
                          {transaction.recurrence === 'yearly' && 'Anual'}
                        </span>
                      )}
                    </div>

                    {/* Payment Status and Due Date Info */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className={`px-2 py-1 rounded-full whitespace-nowrap`}
                        style={{ 
                          backgroundColor: transaction.isPaid ? '#D4EDDA' : '#FFE0B2',
                          color: '#000000'
                        }}>
                        {transaction.isPaid 
                          ? (type === 'expense' ? '✓ Pago' : '✓ Recebido') 
                          : (type === 'expense' ? '⏳ Pendente' : '⏳ A Receber')}
                      </span>
                      
                      {type === 'expense' && transaction.dueDate && (
                        <span className={`px-2 py-1 rounded-full flex items-center gap-1 whitespace-nowrap`}
                          style={{
                            backgroundColor: '#FFE0B2',
                            color: '#000000'
                          }}>
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {overdue ? 'Vencido' : 
                             daysUntilDue === 0 ? 'Vence hoje' : 
                             daysUntilDue === 1 ? 'Vence amanhã' :
                             daysUntilDue !== null && daysUntilDue > 0 ? `${daysUntilDue} dias` :
                             formatBrazilDate(transaction.dueDate)}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`font-semibold text-sm sm:text-lg`}
                      style={{ color: type === 'income' ? theme.primary : theme.accent }}>
                      {formatCurrency(transaction.amount)}
                    </span>
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="p-2 rounded-lg transition-colors text-text bg-cardBackground hover:text-primary hover:bg-cardBorder"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(transaction.id)}
                      className="p-2 rounded-lg transition-colors text-text bg-cardBackground hover:text-accent hover:bg-cardBorder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Transaction Form Modal */}
      {showForm && (
        <TransactionForm
          type={type}
          transaction={editingTransaction}
          replicateTransaction={transactionToReplicate}
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message="Tem certeza de que deseja excluir esta transação? Esta ação não pode ser desfeita."
      />
    </div>
  );
};

export default TransactionList;