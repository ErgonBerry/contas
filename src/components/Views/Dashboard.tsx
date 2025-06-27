import React from 'react';
import { DollarSign, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';
import { ExpenseSummary } from '../../types/expense';
import { formatCurrency } from '../../utils/categories';
import { SummaryCard } from '../Dashboard/SummaryCard';
import { CategoryChart } from '../Dashboard/CategoryChart';

interface DashboardProps {
  summary: ExpenseSummary;
}

export function Dashboard({ summary }: DashboardProps) {
  const savings = summary.paidAmount > 0 
    ? ((summary.paidAmount / summary.totalAmount) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-taupe_gray-800 mb-2">
          Resumo Financeiro
        </h2>
        <p className="text-taupe_gray-600">
          Visão geral das suas contas e gastos
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <SummaryCard
          title="Total de Gastos"
          value={formatCurrency(summary.totalAmount)}
          icon={DollarSign}
          color="bg-cambridge_blue-500"
        />
        
        <SummaryCard
          title="Já Pagos"
          value={formatCurrency(summary.paidAmount)}
          icon={CreditCard}
          color="bg-tea_green-500"
          trend={{
            value: `${savings}%`,
            isPositive: true,
          }}
        />
        
        <SummaryCard
          title="Pendentes"
          value={formatCurrency(summary.pendingAmount)}
          icon={AlertCircle}
          color="bg-chinese_violet-500"
        />
        
        <SummaryCard
          title="Previsão Mensal"
          value={formatCurrency(summary.monthlyForecast)}
          icon={TrendingUp}
          color="bg-celadon-500"
        />
      </div>
      
      <CategoryChart 
        data={summary.categoryBreakdown} 
        total={summary.totalAmount} 
      />
    </div>
  );
}