import React, { useState } from 'react';
import { Transaction, PendingPayment } from '../types';
import { formatCurrency, getCurrentBrazilDate, formatBrazilDate, parseLocalDate, isTransactionOverdue, getDaysUntilDue, getTransactionsWithRecurrence, getBrazilDateString } from '../utils/helpers';
import { ChevronLeft, ChevronRight, AlertTriangle, Clock, CreditCard, TrendingUp, DollarSign, Repeat, Check } from 'lucide-react';
import TransactionDetailModal from './TransactionDetailModal';
import { startOfMonth, endOfMonth } from 'date-fns';

interface CalendarProps {
  transactions: Transaction[];
  onUpdatePaymentStatus: (id: string, isPaid: boolean) => void;
}

interface CalendarEvent {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'expense' | 'income';
  isPaid?: boolean;
  isOverdue?: boolean;
  daysUntilDue?: number | null;
  isRecurring?: boolean;
  originalId?: string; // For recurring transactions
}

const Calendar: React.FC<CalendarProps> = ({ transactions, onUpdatePaymentStatus }) => {
  const [currentDate, setCurrentDate] = useState(getCurrentBrazilDate());
  const [processingPayments, setProcessingPayments] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const handleDayClick = (date: Date) => {
    setSelectedDate(prev => {
      // If the same date is clicked again, deselect it
      if (prev && prev.toDateString() === date.toDateString()) {
        return null;
      }
      return date;
    });
  };

  const handleTransactionClick = (transaction: CalendarEvent) => {
    // Find the original transaction object from the main transactions array
    const originalTransaction = transactions.find(t => t.id === transaction.originalId || t.id === transaction.id);
    if (originalTransaction) {
      setSelectedTransaction(originalTransaction);
      setIsDetailModalOpen(true);
    }
  };

  const getPendingPayments = (): PendingPayment[] => {
    const today = getCurrentBrazilDate();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));

    // FIXED: Get all transactions including recurring ones for the next 30 days (calendar context)
    const allTransactions = getTransactionsWithRecurrence(transactions, today, thirtyDaysFromNow, false);

    return allTransactions
      .filter(t => t.type === 'expense' && !t.isPaid && t.dueDate)
      .map(t => {
        const daysUntilDue = getDaysUntilDue(t.dueDate!);
        
        return {
          id: t.id,
          description: t.description,
          amount: t.amount,
          dueDate: t.dueDate!,
          category: t.category,
          isOverdue: isTransactionOverdue(t),
          daysUntilDue,
        };
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    // const year = date.getFullYear();
    // const month = String(date.getMonth() + 1).padStart(2, '0');
    // const day = String(date.getDate()).padStart(2, '0');
    
    
    const events: CalendarEvent[] = [];

    // FIXED: Get all transactions for this specific date including recurring ones (calendar context)
    const dayStart = new Date(date);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    const dayTransactions = getTransactionsWithRecurrence(transactions, dayStart, dayEnd, false);

    const isSameDay = (d1: Date, d2: Date) => {
      return d1.getFullYear() === d2.getFullYear() &&
             d1.getMonth() === d2.getMonth() &&
             d1.getDate() === d2.getDate();
    };

    // Add all expenses (both paid and pending)
    const expenseEvents = dayTransactions
      .filter(t => {
        const transactionDate = t.dueDate ? parseLocalDate(t.dueDate) : parseLocalDate(t.date);
        return t.type === 'expense' && isSameDay(transactionDate, date);
      })
      .map(t => {
        const daysUntilDue = t.dueDate ? getDaysUntilDue(t.dueDate) : null;
        const isRecurring = t.id.includes('_') || t.recurrence !== 'none';
        
        return {
          id: t.id,
          description: t.description,
          amount: t.amount,
          date: getBrazilDateString(t.dueDate ? parseLocalDate(t.dueDate) : parseLocalDate(t.date)),
          category: t.category,
          type: 'expense' as const,
          isPaid: t.isPaid,
          isOverdue: !t.isPaid && isTransactionOverdue(t),
          daysUntilDue,
          isRecurring,
          originalId: t.id.includes('_') ? t.id.split('_')[0] : undefined,
        };
      });

    // Add income (transaction date)
    const incomeEvents = dayTransactions
      .filter(t => {
        const transactionDate = parseLocalDate(t.date);
        return t.type === 'income' && isSameDay(transactionDate, date);
      })
      .map(t => {
        const isRecurring = t.id.includes('_') || t.recurrence !== 'none';
        
        return {
          id: t.id,
          description: t.description,
          amount: t.amount,
          date: getBrazilDateString(parseLocalDate(t.date)),
          category: t.category,
          type: 'income' as const,
          isPaid: t.isPaid,
          isRecurring,
          originalId: t.id.includes('_') ? t.id.split('_')[0] : undefined,
        };
      });

    events.push(...expenseEvents, ...incomeEvents);
    return events.sort((a, b) => {
      // Sort by type (income first), then by amount
      if (a.type !== b.type) {
        return a.type === 'income' ? -1 : 1;
      }
      return b.amount - a.amount;
    });
  };

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const days: Date[] = [];
    
    // Add empty cells for days before the first day of the month
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(new Date(year, month, -firstDayOfWeek + i + 1));
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handlePaymentStatusUpdate = async (eventId: string, isPaid: boolean) => {
    // Add to processing set to show loading state
    setProcessingPayments(prev => new Set(prev).add(eventId));
    
    try {
      // For recurring transactions, we need to handle the original transaction
      if (eventId.includes('_')) {
        const originalId = eventId.split('_')[0];
        onUpdatePaymentStatus(originalId, isPaid);
      } else {
        onUpdatePaymentStatus(eventId, isPaid);
      }
      
      // Small delay to show the change visually
      setTimeout(() => {
        setProcessingPayments(prev => {
          const newSet = new Set(prev);
          newSet.delete(eventId);
          return newSet;
        });
      }, 500);
    } catch (error) {
      console.error('Error updating payment status:', error);
      setProcessingPayments(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  const pendingPayments = getPendingPayments();
  const overduePayments = pendingPayments.filter(p => p.isOverdue);
  const upcomingPayments = pendingPayments.filter(p => !p.isOverdue && p.daysUntilDue !== null && p.daysUntilDue <= 7);
  const days = getDaysInMonth(currentDate);
  const today = getCurrentBrazilDate();

  // FIXED: Calculate monthly totals for current view including recurring transactions (calendar context)
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const currentMonthEvents = getTransactionsWithRecurrence(transactions, monthStart, monthEnd, false);
  
  const monthlyIncome = currentMonthEvents
    .filter(e => e.type === 'income' && e.isPaid)
    .reduce((sum, e) => sum + e.amount, 0);
  
  const monthlyExpensesPending = currentMonthEvents
    .filter(e => e.type === 'expense' && !e.isPaid)
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Calendário Financeiro
        </h1>
        <p className="text-slate-600">
          Acompanhe receitas e despesas por data
        </p>
        <p className="text-xs text-slate-500 mt-1">
          <Repeat className="w-3 h-3 inline mr-1" />
          Inclui transações recorrentes automaticamente
        </p>
      </div>

      {/* IMPROVED: Summary Cards - Better horizontal layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <h3 className="font-semibold text-red-800 text-sm truncate">Vencidos</h3>
          </div>
          <p className="text-lg sm:text-xl font-bold text-red-900">
            {overduePayments.length}
          </p>
          <p className="text-xs text-red-700 break-words">
            {formatCurrency(overduePayments.reduce((sum, p) => sum + p.amount, 0))}
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-600 flex-shrink-0" />
            <h3 className="font-semibold text-yellow-800 text-sm truncate">Próximos 7 dias</h3>
          </div>
          <p className="text-lg sm:text-xl font-bold text-yellow-900">
            {upcomingPayments.length}
          </p>
          <p className="text-xs text-yellow-700 break-words">
            {formatCurrency(upcomingPayments.reduce((sum, p) => sum + p.amount, 0))}
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
            <h3 className="font-semibold text-green-800 text-sm truncate">Receitas do Mês</h3>
          </div>
          <p className="text-sm sm:text-lg font-bold text-green-900 break-words">
            {formatCurrency(monthlyIncome)}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <h3 className="font-semibold text-blue-800 text-sm truncate">Despesas Pendentes</h3>
          </div>
          <p className="text-sm sm:text-lg font-bold text-blue-900 break-words">
            {formatCurrency(monthlyExpensesPending)}
          </p>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          
          <h2 className="text-lg font-semibold text-slate-800 truncate px-4">
            {formatBrazilDate(currentDate, 'MMMM yyyy')}
          </h2>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-slate-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = day.toDateString() === today.toDateString();
            const eventsForDay = getEventsForDate(day);
            const hasOverdue = eventsForDay.some(e => e.type === 'expense' && e.isOverdue);
            const hasUpcoming = eventsForDay.some(e => e.type === 'expense' && !e.isOverdue && !e.isPaid);
            const hasIncome = eventsForDay.some(e => e.type === 'income');
            const hasRecurring = eventsForDay.some(e => e.isRecurring);

            return (
              <div
                key={index}
                className={`min-h-[80px] p-1 border border-slate-100 rounded-lg cursor-pointer ${
                  !isCurrentMonth ? 'bg-slate-50 text-slate-400' :
                  isToday ? 'bg-blue-100 border-blue-300' :
                  hasOverdue ? 'bg-red-50 border-red-200' :
                  hasUpcoming ? 'bg-yellow-50 border-yellow-200' :
                  hasIncome ? 'bg-green-50 border-green-200' :
                  'bg-white hover:bg-slate-50'
                } ${selectedDate && day.toDateString() === selectedDate.toDateString() ? 'ring-2 ring-blue-500' : ''} transition-colors`}
                onClick={() => isCurrentMonth && handleDayClick(day)}
              >
                <div className="text-sm font-medium mb-1 flex items-center justify-between">
                  <span>{day.getDate()}</span>
                  {hasRecurring && (
                    <>
                      <Repeat className="w-2 h-2 text-slate-400" />
                      <span className="sr-only">Contém transações recorrentes</span>
                    </>
                  )}
                </div>
                
                {eventsForDay.length > 0 && (
                  <div className="space-y-1">
                    {eventsForDay.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded truncate flex items-center gap-1 cursor-pointer ${
                          event.type === 'income' 
                            ? 'bg-green-200 text-green-800' 
                            : event.isOverdue 
                            ? 'bg-red-200 text-red-800' 
                            : event.isPaid
                            ? 'bg-green-200 text-green-800'
                            : 'bg-yellow-200 text-yellow-800'
                        }`}
                        title={`${event.description} - ${formatCurrency(event.amount)}${event.isRecurring ? ' (Recorrente)' : ''}${event.type === 'expense' ? (event.isPaid ? ' - Pago' : ' - Pendente') : ''}`}
                        onClick={() => handleTransactionClick(event)}
                      >
                        {event.type === 'income' ? (
                          <TrendingUp className="w-2 h-2 flex-shrink-0" />
                        ) : event.isPaid ? (
                          <Check className="w-2 h-2 flex-shrink-0" />
                        ) : (
                          <DollarSign className="w-2 h-2 flex-shrink-0" />
                        )}
                        <span className="truncate">
                          {formatCurrency(event.amount)}
                        </span>
                        {event.isRecurring && (
                          <Repeat className="w-2 h-2 flex-shrink-0 opacity-70" />
                        )}
                      </div>
                    ))}
                    {eventsForDay.length > 3 && (
                      <div className="text-xs text-slate-600 text-center">
                        +{eventsForDay.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded Day View */}
      {selectedDate && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 truncate">
            Transações de {formatBrazilDate(selectedDate)}
          </h3>
          <div className="space-y-3">
            {getEventsForDate(selectedDate).length > 0 ? (
              getEventsForDate(selectedDate).map(event => {
                const isProcessing = processingPayments.has(event.id);
                return (
                  <div
                    key={event.id}
                    className={`flex items-center justify-between p-4 rounded-xl border gap-3 transition-all cursor-pointer ${
                      event.type === 'income'
                        ? 'bg-green-50 border-green-200'
                        : event.isPaid
                        ? 'bg-green-50 border-green-200'
                        : event.isOverdue
                        ? 'bg-red-50 border-red-200'
                        : 'bg-yellow-50 border-yellow-200'
                    } ${isProcessing ? 'opacity-75' : ''}`}
                    onClick={() => handleTransactionClick(event)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {event.type === 'income' ? (
                          <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : event.isPaid ? (
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <DollarSign className="w-4 h-4 text-orange-600 flex-shrink-0" />
                        )}
                        <h4 className="font-medium text-slate-900 truncate">
                          {event.description}
                        </h4>
                        {event.isRecurring && (
                          <>
                            <Repeat className="w-3 h-3 text-slate-500 flex-shrink-0" />
                            <span className="sr-only">Transação recorrente</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 flex-wrap">
                        <span className="bg-slate-200 px-2 py-1 rounded-full truncate max-w-[120px]">
                          {event.category}
                        </span>
                        {event.type === 'expense' && (
                          <span className={`px-2 py-1 rounded-full whitespace-nowrap ${
                            event.isPaid
                              ? 'bg-green-200 text-green-800'
                              : event.isOverdue
                              ? 'bg-red-200 text-red-800'
                              : event.daysUntilDue === 0
                              ? 'bg-yellow-200 text-yellow-800'
                              : event.daysUntilDue === 1
                              ? 'bg-yellow-200 text-yellow-800'
                              : 'bg-blue-200 text-blue-800'
                          }`}>
                            {event.isPaid ? '✓ Pago' :
                              event.isOverdue ? 'Vencido' :
                              event.daysUntilDue === 0 ? 'Vence hoje' :
                              event.daysUntilDue === 1 ? 'Vence amanhã' :
                              event.daysUntilDue !== null ? `${event.daysUntilDue} dias` : 'Sem vencimento'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`font-semibold text-sm sm:text-lg break-words ${
                        event.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {event.type === 'income' ? '+' : '-'}{formatCurrency(event.amount)}
                      </span>
                      {event.type === 'expense' && !event.isPaid && (
                        <button
                          onClick={() => handlePaymentStatusUpdate(event.id, true)}
                          disabled={isProcessing}
                          className={`px-3 py-2 text-white rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            isProcessing
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-green-500 hover:bg-green-600 hover:scale-105'
                          }`}
                        >
                          {isProcessing ? (
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                              Processando...
                            </div>
                          ) : (
                            'Marcar como Pago'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-600 text-center">Nenhuma transação para esta data.</p>
            )}
          </div>
        </div>
      )}

      {/* Events List for Current Month */}
      {currentMonthEvents.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 truncate">
            Eventos do Mês - {formatBrazilDate(currentDate, 'MMMM yyyy')}
          </h3>
          
          <div className="space-y-3">
            {currentMonthEvents
              .sort((a, b) => {
                const dateA = a.type === 'income' ? a.date : (a.dueDate || a.date);
                const dateB = b.type === 'income' ? b.date : (b.dueDate || b.date);
                return new Date(dateA).getTime() - new Date(dateB).getTime();
              })
              .slice(0, 15)
              .map(event => {
                const eventDate = event.type === 'income' ? event.date : (event.dueDate || event.date);
                const isRecurring = event.id.includes('_') || event.recurrence !== 'none';
                const isOverdue = event.type === 'expense' && !event.isPaid && isTransactionOverdue(event);
                const daysUntilDue = event.dueDate ? getDaysUntilDue(event.dueDate) : null;
                const isProcessing = processingPayments.has(event.id);
                
                return (
                  <div
                    key={`${event.id}-${eventDate}`}
                    className={`flex items-center justify-between p-4 rounded-xl border gap-3 transition-all ${
                      event.type === 'income'
                        ? 'bg-green-50 border-green-200'
                        : event.isPaid
                        ? 'bg-green-50 border-green-200'
                        : isOverdue 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-yellow-50 border-yellow-200'
                    } ${isProcessing ? 'opacity-75' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {event.type === 'income' ? (
                          <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : event.isPaid ? (
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <DollarSign className="w-4 h-4 text-orange-600 flex-shrink-0" />
                        )}
                        <h4 className="font-medium text-slate-900 truncate">
                          {event.description}
                        </h4>
                        {isRecurring && (
                          <>
                            <Repeat className="w-3 h-3 text-slate-500 flex-shrink-0" />
                            <span className="sr-only">Transação recorrente</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 flex-wrap">
                        <span className="bg-slate-200 px-2 py-1 rounded-full truncate max-w-[120px]">
                          {event.category}
                        </span>
                        <span className="whitespace-nowrap">
                          {formatBrazilDate(new Date(eventDate))}
                        </span>
                        {event.type === 'expense' && (
                          <>
                            <span className={`px-2 py-1 rounded-full whitespace-nowrap ${
                              event.isPaid 
                                ? 'bg-green-200 text-green-800' 
                                : isOverdue 
                                ? 'bg-red-200 text-red-800' 
                                : daysUntilDue === 0 
                                ? 'bg-yellow-200 text-yellow-800'
                                : daysUntilDue === 1 
                                ? 'bg-yellow-200 text-yellow-800'
                                : 'bg-blue-200 text-blue-800'
                            }`}>
                              {event.isPaid ? '✓ Pago' :
                               isOverdue ? 'Vencido' : 
                               daysUntilDue === 0 ? 'Vence hoje' :
                               daysUntilDue === 1 ? 'Vence amanhã' :
                               daysUntilDue !== null ? `${daysUntilDue} dias` : 'Sem vencimento'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`font-semibold text-sm sm:text-lg break-words ${
                        event.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {event.type === 'income' ? '+' : '-'}{formatCurrency(event.amount)}
                      </span>
                      {event.type === 'expense' && !event.isPaid && (
                        <button
                          onClick={() => handlePaymentStatusUpdate(event.id, true)}
                          disabled={isProcessing}
                          className={`px-3 py-2 text-white rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            isProcessing 
                              ? 'bg-gray-400 cursor-not-allowed' 
                              : 'bg-green-500 hover:bg-green-600 hover:scale-105'
                          }`}
                        >
                          {isProcessing ? (
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                              Processando...
                            </div>
                          ) : (
                            'Marcar como Pago'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Pending Payments List */}
      {/* Pending Payments List - Temporarily removed for debugging */}

      <TransactionDetailModal
        transaction={selectedTransaction}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
};

export default Calendar;