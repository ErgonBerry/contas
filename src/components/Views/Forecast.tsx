import React, { useState } from 'react';
import { TrendingUp, Calendar, DollarSign, AlertTriangle, BarChart3 } from 'lucide-react';
import { Expense, ExpenseCategory } from '../../types/expense';
import { formatCurrency, categoryLabels } from '../../utils/categories';

interface ForecastProps {
  expenses: Expense[];
}

interface ForecastPeriod {
  id: string;
  label: string;
  months: number;
}

const forecastPeriods: ForecastPeriod[] = [
  { id: '1', label: '1 Mês', months: 1 },
  { id: '3', label: '3 Meses', months: 3 },
  { id: '6', label: '6 Meses', months: 6 },
  { id: '12', label: '1 Ano', months: 12 },
];

export function Forecast({ expenses }: ForecastProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<ForecastPeriod>(forecastPeriods[0]);

  const calculateForecast = () => {
    const recurringExpenses = expenses.filter(expense => expense.recurring);
    
    const monthlyTotal = recurringExpenses
      .filter(expense => expense.recurrenceType === 'monthly')
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    const weeklyTotal = recurringExpenses
      .filter(expense => expense.recurrenceType === 'weekly')
      .reduce((sum, expense) => sum + expense.amount, 0) * 4.33; // Average weeks per month
    
    const yearlyTotal = recurringExpenses
      .filter(expense => expense.recurrenceType === 'yearly')
      .reduce((sum, expense) => sum + expense.amount, 0) / 12;
    
    const monthlyForecast = monthlyTotal + weeklyTotal + yearlyTotal;
    const periodForecast = monthlyForecast * selectedPeriod.months;
    
    return {
      monthlyForecast,
      periodForecast,
      recurringCount: recurringExpenses.length,
    };
  };

  const getCategoryForecast = () => {
    const recurringExpenses = expenses.filter(expense => expense.recurring);
    const categoryTotals: Record<ExpenseCategory, number> = {} as Record<ExpenseCategory, number>;
    
    recurringExpenses.forEach(expense => {
      let monthlyAmount = expense.amount;
      
      if (expense.recurrenceType === 'weekly') {
        monthlyAmount = expense.amount * 4.33;
      } else if (expense.recurrenceType === 'yearly') {
        monthlyAmount = expense.amount / 12;
      }
      
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + monthlyAmount;
    });
    
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category: category as ExpenseCategory,
        monthlyAmount: amount,
        periodAmount: amount * selectedPeriod.months,
      }))
      .sort((a, b) => b.monthlyAmount - a.monthlyAmount);
  };

  const getUpcomingExpenses = () => {
    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + selectedPeriod.months);
    
    return expenses
      .filter(expense => {
        const dueDate = new Date(expense.dueDate);
        return !expense.paid && dueDate >= now && dueDate <= endDate;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  };

  const forecast = calculateForecast();
  const categoryForecast = getCategoryForecast();
  const upcomingExpenses = getUpcomingExpenses();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-taupe_gray-800 mb-2">
          Previsão de Gastos
        </h2>
        <p className="text-taupe_gray-600">
          Planeje seus gastos futuros baseado nas contas recorrentes
        </p>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <h3 className="text-lg font-semibold text-taupe_gray-800 mb-3">
          Período de Previsão
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {forecastPeriods.map(period => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period)}
              className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod.id === period.id
                  ? 'bg-tea_green-500 text-white'
                  : 'bg-gray-100 text-taupe_gray-600 hover:bg-gray-200'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Forecast Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-cambridge_blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-cambridge_blue-600" />
            </div>
            <div>
              <p className="text-sm text-taupe_gray-600">Previsão Mensal</p>
              <p className="text-xl font-bold text-taupe_gray-900">
                {formatCurrency(forecast.monthlyForecast)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-tea_green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-tea_green-600" />
            </div>
            <div>
              <p className="text-sm text-taupe_gray-600">
                {selectedPeriod.label}
              </p>
              <p className="text-xl font-bold text-taupe_gray-900">
                {formatCurrency(forecast.periodForecast)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryForecast.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-taupe_gray-800 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Previsão por Categoria
          </h3>
          <div className="space-y-3">
            {categoryForecast.map(({ category, monthlyAmount, periodAmount }) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm font-medium text-taupe_gray-700">
                  {categoryLabels[category]}
                </span>
                <div className="text-right">
                  <p className="text-sm font-semibold text-taupe_gray-900">
                    {formatCurrency(periodAmount)}
                  </p>
                  <p className="text-xs text-taupe_gray-500">
                    {formatCurrency(monthlyAmount)}/mês
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Expenses */}
      {upcomingExpenses.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-taupe_gray-800 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Próximas Contas
          </h3>
          <div className="space-y-3">
            {upcomingExpenses.map(expense => (
              <div key={expense.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-taupe_gray-800">
                    {expense.title}
                  </p>
                  <p className="text-xs text-taupe_gray-500">
                    {new Date(expense.dueDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <p className="text-sm font-semibold text-taupe_gray-900">
                  {formatCurrency(expense.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Recurring Expenses */}
      {forecast.recurringCount === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-taupe_gray-800 mb-2">
            Nenhuma conta recorrente
          </h3>
          <p className="text-taupe_gray-600">
            Adicione contas recorrentes para ver previsões de gastos
          </p>
        </div>
      )}
    </div>
  );
}