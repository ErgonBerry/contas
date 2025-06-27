import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Expense, ExpenseCategory } from '../../types/expense';
import { categoryLabels } from '../../utils/categories';

interface ExpenseFormProps {
  expense?: Expense;
  onSave: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  currentUser: string;
}

export function ExpenseForm({ expense, onSave, onCancel, currentUser }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    title: expense?.title || '',
    amount: expense?.amount || 0,
    category: expense?.category || 'utilities' as ExpenseCategory,
    dueDate: expense?.dueDate || new Date().toISOString().split('T')[0],
    recurring: expense?.recurring || false,
    recurrenceType: expense?.recurrenceType || 'monthly' as const,
    paid: expense?.paid || false,
    description: expense?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      ...formData,
      createdBy: expense?.createdBy || currentUser,
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 rounded-t-2xl sm:rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-taupe_gray-800">
              {expense ? 'Editar Conta' : 'Nova Conta'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-taupe_gray-600" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-taupe_gray-700 mb-2">
              Nome da Conta
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea_green-500 focus:border-transparent"
              placeholder="Ex: Conta de luz"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-taupe_gray-700 mb-2">
              Valor
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea_green-500 focus:border-transparent"
              placeholder="0,00"
              step="0.01"
              min="0"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-taupe_gray-700 mb-2">
              Categoria
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value as ExpenseCategory)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea_green-500 focus:border-transparent"
            >
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-taupe_gray-700 mb-2">
              Data de Vencimento
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea_green-500 focus:border-transparent"
              required
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="recurring"
              checked={formData.recurring}
              onChange={(e) => handleChange('recurring', e.target.checked)}
              className="w-4 h-4 text-tea_green-600 bg-gray-100 border-gray-300 rounded focus:ring-tea_green-500"
            />
            <label htmlFor="recurring" className="text-sm font-medium text-taupe_gray-700">
              Conta recorrente
            </label>
          </div>
          
          {formData.recurring && (
            <div>
              <label className="block text-sm font-medium text-taupe_gray-700 mb-2">
                Frequência
              </label>
              <select
                value={formData.recurrenceType}
                onChange={(e) => handleChange('recurrenceType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea_green-500 focus:border-transparent"
              >
                <option value="monthly">Mensal</option>
                <option value="weekly">Semanal</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="paid"
              checked={formData.paid}
              onChange={(e) => handleChange('paid', e.target.checked)}
              className="w-4 h-4 text-tea_green-600 bg-gray-100 border-gray-300 rounded focus:ring-tea_green-500"
            />
            <label htmlFor="paid" className="text-sm font-medium text-taupe_gray-700">
              Já foi paga
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-taupe_gray-700 mb-2">
              Descrição (opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea_green-500 focus:border-transparent"
              placeholder="Informações adicionais..."
              rows={3}
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-taupe_gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-tea_green-500 hover:bg-tea_green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Salvar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}