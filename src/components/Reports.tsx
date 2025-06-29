import React, { useRef, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Transaction, SavingsGoal } from '../types';
import { getMonthlyData, getCategoryData, formatCurrency } from '../utils/helpers';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface ReportsProps {
  transactions: Transaction[];
  savingsGoals?: SavingsGoal[];
}

const Reports: React.FC<ReportsProps> = ({ transactions, savingsGoals = [] }) => {
  const monthlyData = getMonthlyData(transactions, savingsGoals);
  const categoryData = getCategoryData(transactions);

  const barChartData = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Receitas',
        data: monthlyData.map(d => d.income),
        backgroundColor: '#10B981',
        borderRadius: 8,
      },
      {
        label: 'Despesas',
        data: monthlyData.map(d => d.expenses),
        backgroundColor: '#EF4444',
        borderRadius: 8,
      },
      {
        label: 'Metas',
        data: monthlyData.map(d => d.goalsImpact || 0),
        backgroundColor: '#F59E0B',
        borderRadius: 8,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          },
        },
      },
    },
  };

  const doughnutData = {
    labels: categoryData.map(d => d.category),
    datasets: [
      {
        data: categoryData.map(d => d.amount),
        backgroundColor: categoryData.map(d => d.color),
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const data = categoryData[context.dataIndex];
            return `${data.category}: ${formatCurrency(data.amount)} (${data.percentage.toFixed(1)}%)`;
          },
        },
      },
    },
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-600 mb-2">Nenhum dado para exibir</p>
        <p className="text-sm text-slate-500">
          Adicione algumas transações para ver os relatórios
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Relatórios Financeiros
        </h1>
        <p className="text-slate-600">
          Análise detalhada das suas finanças
        </p>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-slate-800 truncate">
              Evolução Mensal
            </h2>
            <p className="text-sm text-slate-600 truncate">
              Receitas vs Despesas vs Metas nos últimos 6 meses
            </p>
          </div>
        </div>
        <div className="h-64">
          <Bar data={barChartData} options={barChartOptions} />
        </div>
      </div>

      {/* Category Distribution */}
      {categoryData.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <PieChart className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-slate-800 truncate">
                Gastos por Categoria
              </h2>
              <p className="text-sm text-slate-600 truncate">
                Distribuição das suas despesas pagas
              </p>
            </div>
          </div>
          <div className="h-64 mb-6">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
          
          {/* Category Details */}
          <div className="space-y-3">
            {categoryData.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div 
                    className="w-4 h-4 rounded flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium text-slate-800 truncate">
                    {category.category}
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-slate-900">
                    {formatCurrency(category.amount)}
                  </p>
                  <p className="text-sm text-slate-600">
                    {category.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {monthlyData.slice(-3).map((month, index) => (
          <div key={index} className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-800 mb-3 truncate">
              {month.month}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 truncate pr-2">Receitas</span>
                <span className="font-medium text-green-600 flex-shrink-0">
                  {formatCurrency(month.income)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 truncate pr-2">Despesas</span>
                <span className="font-medium text-red-600 flex-shrink-0">
                  {formatCurrency(month.expenses)}
                </span>
              </div>
              {month.goalsImpact && month.goalsImpact > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 truncate pr-2">Metas</span>
                  <span className="font-medium text-amber-600 flex-shrink-0">
                    {formatCurrency(month.goalsImpact)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="font-medium text-slate-800 truncate pr-2">Saldo</span>
                <span className={`font-semibold flex-shrink-0 ${
                  month.balance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(month.balance)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;