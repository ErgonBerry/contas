import React from 'react';
import { ExpenseCategory } from '../../types/expense';
import { categoryLabels, categoryColors, formatCurrency } from '../../utils/categories';

interface CategoryChartProps {
  data: Record<ExpenseCategory, number>;
  total: number;
}

export function CategoryChart({ data, total }: CategoryChartProps) {
  const categories = Object.entries(data)
    .filter(([_, amount]) => amount > 0)
    .sort(([_, a], [__, b]) => b - a);

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-taupe_gray-800 mb-4">
          Gastos por Categoria
        </h3>
        <div className="text-center py-8">
          <p className="text-taupe_gray-500">Nenhum gasto registrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-taupe_gray-800 mb-4">
        Gastos por Categoria
      </h3>
      
      <div className="space-y-3">
        {categories.map(([category, amount]) => {
          const percentage = total > 0 ? (amount / total) * 100 : 0;
          
          return (
            <div key={category} className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${categoryColors[category as ExpenseCategory]}`} />
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-taupe_gray-700">
                    {categoryLabels[category as ExpenseCategory]}
                  </span>
                  <span className="text-sm font-semibold text-taupe_gray-900">
                    {formatCurrency(amount)}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${categoryColors[category as ExpenseCategory]}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <div className="text-xs text-taupe_gray-500 mt-1">
                  {percentage.toFixed(1)}% do total
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}