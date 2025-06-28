import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, DollarSign } from 'lucide-react';
import { Expense } from '../../types/expense';
import { formatCurrency, categoryColors } from '../../utils/categories';
import { format, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';

interface CalendarProps {
  expenses: Expense[];
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  expenses: Expense[];
}

export function Calendar({ expenses }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const days: CalendarDay[] = [];
    
    // Previous month days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      days.push({
        date,
        isCurrentMonth: false,
        expenses: getExpensesForDate(date),
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        expenses: getExpensesForDate(date),
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        expenses: getExpensesForDate(date),
      });
    }
    
    return days;
  };

  const getExpensesForDate = (date: Date): Expense[] => {
    const utcDate = new Date(Date.UTC(
      date.getFullYear(), 
      date.getMonth(), 
      date.getDate()
    ));

    const dateStr = utcDate.toISOString().split('T')[0];
    return expenses.filter(expense => {
      // Garante que a dueDate está no formato esperado (YYYY-MM-DD)
      const expenseDateStr = expense.dueDate.split('T')[0];
      return expenseDateStr === dateStr;
    });
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
    setSelectedDate(null);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date): boolean => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  const getTotalForDate = (expenses: Expense[]): number => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getOverdueExpenses = (): Expense[] => {
    const today = new Date();
    // Normaliza para UTC (meia-noite UTC)
    const todayUTC = new Date(Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ));
    
    return expenses.filter(expense => {
      const dueDate = new Date(expense.dueDate);
      return !expense.paid && dueDate < todayUTC;
    });
  };

  const calendarDays = generateCalendarDays();
  const selectedDateExpenses = selectedDate ? getExpensesForDate(selectedDate) : [];
  const overdueExpenses = getOverdueExpenses();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-taupe_gray-800 mb-2">
          Calendário de Vencimentos
        </h2>
        <p className="text-taupe_gray-600">
          Visualize suas contas por data de vencimento
        </p>
      </div>

      {/* Overdue Alert */}
      {overdueExpenses.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-5 h-5 text-red-500" />
            <h3 className="text-sm font-semibold text-red-800">
              Contas Vencidas ({overdueExpenses.length})
            </h3>
          </div>
          <div className="space-y-1">
            {overdueExpenses.slice(0, 3).map(expense => (
              <div key={expense.id} className="flex items-center justify-between text-sm">
                <span className="text-red-700">{expense.title}</span>
                <span className="font-medium text-red-800">
                  {formatCurrency(expense.amount)}
                </span>
              </div>
            ))}
            {overdueExpenses.length > 3 && (
              <p className="text-xs text-red-600">
                +{overdueExpenses.length - 3} outras contas vencidas
              </p>
            )}
          </div>
        </div>
      )}

      {/* Calendar Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-taupe_gray-600" />
          </button>
          
          <h3 className="text-lg font-semibold text-taupe_gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-taupe_gray-600" />
          </button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {weekDays.map(day => (
            <div key={day} className="p-3 text-center">
              <span className="text-xs font-medium text-taupe_gray-500 uppercase">
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const hasExpenses = day.expenses.length > 0;
            const totalAmount = getTotalForDate(day.expenses);
            const hasOverdue = day.expenses.some(expense => 
              !expense.paid && new Date(expense.dueDate) < new Date()
            );

            return (
              <button
                key={index}
                onClick={() => setSelectedDate(day.date)}
                className={`p-2 min-h-[60px] border-r border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  !day.isCurrentMonth ? 'text-taupe_gray-300' : ''
                } ${
                  isToday(day.date) ? 'bg-tea_green-50 text-tea_green-700' : ''
                } ${
                  isSelected(day.date) ? 'bg-cambridge_blue-100 text-cambridge_blue-800' : ''
                }`}
              >
                <div className="text-sm font-medium mb-1">
                  {day.date.getDate()}
                </div>
                
                {hasExpenses && (
                  <div className="space-y-1">
                    <div className={`w-2 h-2 rounded-full mx-auto ${
                      hasOverdue ? 'bg-red-500' : 'bg-cambridge_blue-500'
                    }`} />
                    <div className="text-xs text-taupe_gray-600">
                      {formatCurrency(totalAmount)}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && selectedDateExpenses.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-taupe_gray-800 mb-4 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2" />
            {selectedDate.toLocaleDateString('pt-BR', { 
              timeZone: 'UTC', // Adiciona isso
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          
          <div className="space-y-3">
            {selectedDateExpenses.map(expense => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${categoryColors[expense.category]}`} />
                  <div>
                    <p className="text-sm font-medium text-taupe_gray-800">
                      {expense.title}
                    </p>
                    <p className="text-xs text-taupe_gray-500">
                      {expense.paid ? 'Paga' : 'Pendente'}
                    </p>
                  </div>
                </div>
                <p className={`text-sm font-semibold ${
                  expense.paid ? 'text-tea_green-600' : 'text-taupe_gray-900'
                }`}>
                  {formatCurrency(expense.amount)}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-taupe_gray-700">
                Total do dia:
              </span>
              <span className="text-lg font-bold text-taupe_gray-900">
                {formatCurrency(getTotalForDate(selectedDateExpenses))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* No Expenses for Selected Date */}
      {selectedDate && selectedDateExpenses.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">
          <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-taupe_gray-800 mb-2">
            Nenhuma conta neste dia
          </h3>
          <p className="text-taupe_gray-600">
            {selectedDate.toLocaleDateString('pt-BR')} não possui contas agendadas
          </p>
        </div>
      )}
    </div>
  );
}