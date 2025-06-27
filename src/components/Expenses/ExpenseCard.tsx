import React from 'react';
import { Calendar, Edit, Trash2, Check, Clock } from 'lucide-react';
import { Expense } from '../../types/expense';
import { formatCurrency, formatDate, categoryLabels, categoryColors } from '../../utils/categories';

interface ExpenseCardProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onTogglePaid: (id: string) => void;
}

export function ExpenseCard({ expense, onEdit, onDelete, onTogglePaid }: ExpenseCardProps) {
  const isOverdue = !expense.paid && new Date(expense.dueDate) < new Date();
  
  return (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 p-4 transition-all hover:shadow-md ${
      expense.paid 
        ? 'border-tea_green-500 opacity-75' 
        : isOverdue 
        ? 'border-red-500' 
        : 'border-cambridge_blue-500'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className={`inline-block w-3 h-3 rounded-full ${categoryColors[expense.category]}`} />
            <span className="text-xs font-medium text-taupe_gray-500 uppercase tracking-wide">
              {categoryLabels[expense.category]}
            </span>
          </div>
          
          <h3 className={`font-semibold text-taupe_gray-800 ${expense.paid ? 'line-through' : ''}`}>
            {expense.title}
          </h3>
          
          <p className="text-xl font-bold text-taupe_gray-900 mt-1">
            {formatCurrency(expense.amount)}
          </p>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onTogglePaid(expense.id)}
            className={`p-2 rounded-lg transition-colors ${
              expense.paid
                ? 'bg-tea_green-100 text-tea_green-600 hover:bg-tea_green-200'
                : 'bg-gray-100 text-gray-400 hover:bg-tea_green-100 hover:text-tea_green-600'
            }`}
          >
            <Check className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onEdit(expense)}
            className="p-2 rounded-lg text-cambridge_blue-600 hover:bg-cambridge_blue-100 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onDelete(expense.id)}
            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-taupe_gray-500">
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(expense.dueDate)}</span>
          {isOverdue && (
            <span className="text-red-500 font-medium ml-2">Vencida</span>
          )}
        </div>
        
        {expense.recurring && (
          <div className="flex items-center space-x-1 text-cambridge_blue-600">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Recorrente</span>
          </div>
        )}
      </div>
      
      {expense.description && (
        <p className="text-sm text-taupe_gray-600 mt-2 pt-2 border-t border-gray-100">
          {expense.description}
        </p>
      )}
    </div>
  );
}