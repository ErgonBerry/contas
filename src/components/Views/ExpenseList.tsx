import React, { useState } from 'react';
import { Filter, Search } from 'lucide-react';
import { Expense, ExpenseFilter } from '../../types/expense';
import { ExpenseCard } from '../Expenses/ExpenseCard';
import { categoryLabels } from '../../utils/categories';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onTogglePaid: (id: string) => void;
}

export function ExpenseList({ expenses, onEdit, onDelete, onTogglePaid }: ExpenseListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<ExpenseFilter>({});
  const [showFilters, setShowFilters] = useState(false);

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filter.category || expense.category === filter.category;
    const matchesPaid = filter.paid === undefined || expense.paid === filter.paid;
    
    return matchesSearch && matchesCategory && matchesPaid;
  });

  const upcomingExpenses = filteredExpenses.filter(expense => 
    !expense.paid && new Date(expense.dueDate) >= new Date()
  );
  
  const overdueExpenses = filteredExpenses.filter(expense => 
    !expense.paid && new Date(expense.dueDate) < new Date()
  );
  
  const paidExpenses = filteredExpenses.filter(expense => expense.paid);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-taupe_gray-800 mb-2">
          Minhas Contas
        </h2>
        <p className="text-taupe_gray-600">
          Gerencie todas as suas contas e despesas
        </p>
      </div>
      
      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-taupe_gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar contas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea_green-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              showFilters 
                ? 'bg-cambridge_blue-100 text-cambridge_blue-700' 
                : 'bg-gray-100 text-taupe_gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filtros</span>
          </button>
          
          {(filter.category || filter.paid !== undefined) && (
            <button
              onClick={() => setFilter({})}
              className="text-sm text-red-500 hover:text-red-600"
            >
              Limpar filtros
            </button>
          )}
        </div>
        
        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-taupe_gray-700 mb-2">
                Categoria
              </label>
              <select
                value={filter.category || ''}
                onChange={(e) => setFilter(prev => ({ 
                  ...prev, 
                  category: e.target.value || undefined 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea_green-500"
              >
                <option value="">Todas as categorias</option>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-taupe_gray-700 mb-2">
                Status
              </label>
              <select
                value={filter.paid === undefined ? '' : filter.paid ? 'paid' : 'pending'}
                onChange={(e) => setFilter(prev => ({ 
                  ...prev, 
                  paid: e.target.value === '' ? undefined : e.target.value === 'paid'
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea_green-500"
              >
                <option value="">Todos os status</option>
                <option value="pending">Pendentes</option>
                <option value="paid">Pagas</option>
              </select>
            </div>
          </div>
        )}
      </div>
      
      {/* Expense Lists */}
      {overdueExpenses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center">
            Contas Vencidas ({overdueExpenses.length})
          </h3>
          <div className="space-y-3">
            {overdueExpenses.map(expense => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onEdit={onEdit}
                onDelete={onDelete}
                onTogglePaid={onTogglePaid}
              />
            ))}
          </div>
        </div>
      )}
      
      {upcomingExpenses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-cambridge_blue-700 mb-3">
            Próximas Contas ({upcomingExpenses.length})
          </h3>
          <div className="space-y-3">
            {upcomingExpenses.map(expense => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onEdit={onEdit}
                onDelete={onDelete}
                onTogglePaid={onTogglePaid}
              />
            ))}
          </div>
        </div>
      )}
      
      {paidExpenses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-tea_green-700 mb-3">
            Contas Pagas ({paidExpenses.length})
          </h3>
          <div className="space-y-3">
            {paidExpenses.map(expense => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onEdit={onEdit}
                onDelete={onDelete}
                onTogglePaid={onTogglePaid}
              />
            ))}
          </div>
        </div>
      )}
      
      {filteredExpenses.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-taupe_gray-800 mb-2">
            Nenhuma conta encontrada
          </h3>
          <p className="text-taupe_gray-600">
            {searchTerm ? 'Tente ajustar sua busca' : 'Adicione sua primeira conta para começar'}
          </p>
        </div>
      )}
    </div>
  );
}