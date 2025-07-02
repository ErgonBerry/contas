import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { formatCurrency, isTransactionOverdue, getDaysUntilDue, formatBrazilDate } from '../utils/helpers';
import { Plus, Trash2, Filter, Check, Calendar, CreditCard, Clock, Edit3 } from 'lucide-react';
import TransactionForm from './TransactionForm';
import ConfirmationModal from './ConfirmationModal';

interface TransactionListProps {
  type: 'expense' | 'income';
  transactions: Transaction[];
  onAdd: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
  onUpdatePaymentStatus: (id: string, isPaid: boolean) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
  type,
  transactions,
  onAdd,
  onUpdate,
  onDelete,
  onUpdatePaymentStatus
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  useEffect(() => {
    setCategoryFilter('all');
    setPaymentFilter('all'); // Reset payment filter when type changes
  }, [type]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  
  const filteredTransactions = transactions
    .filter(t => t.type === type)
    .filter(t => categoryFilter === 'all' || t.category === categoryFilter)
    .filter(t => {
      if (paymentFilter === 'all') return true;
      if (paymentFilter === 'paid') return t.isPaid;
      if (paymentFilter === 'pending') return !t.isPaid;
      return true;
    });

  const categories = [...new Set(transactions.filter(t => t.type === type).map(t => t.category))];
  
  const total = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const paidTotal = filteredTransactions.filter(t => t.isPaid).reduce((sum, t) => sum + t.amount, 0);
  const pendingTotal = filteredTransactions.filter(t => !t.isPaid).reduce((sum, t) => sum + t.amount, 0);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleSubmit = (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (editingTransaction) {
      onUpdate(editingTransaction.id, transactionData);
    } else {
      onAdd(transactionData);
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-slate-800 mb-1 truncate">
            {type === 'expense' ? 'Despesas' : 'Receitas'}
          </h2>
          <div className="text-sm text-slate-600 space-y-1">
            <p className="truncate">Total: <span className="font-medium">{formatCurrency(total)}</span></p>
            {type === 'expense' && (
              <>
                <p className="truncate">Pago: <span className="font-medium text-green-600">{formatCurrency(paidTotal)}</span></p>
                <p className="truncate">Pendente: <span className="font-medium text-orange-600">{formatCurrency(pendingTotal)}</span></p>
              </>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className={`p-3 rounded-full text-white shadow-lg transition-all hover:scale-105 flex-shrink-0 ${
            type === 'expense' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                categoryFilter === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todas
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                  categoryFilter === category 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
            <CreditCard className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <button
              onClick={() => setPaymentFilter('all')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                paymentFilter === 'all' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setPaymentFilter('paid')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                paymentFilter === 'paid' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Pagos
            </button>
            <button
              onClick={() => setPaymentFilter('pending')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                paymentFilter === 'pending' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Pendentes
            </button>
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 mb-4">
              Nenhuma {type === 'expense' ? 'despesa' : 'receita'} registrada
            </p>
            <button
              onClick={() => setShowForm(true)}
              className={`px-6 py-3 rounded-xl text-white font-medium transition-colors ${
                type === 'expense' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              Adicionar {type === 'expense' ? 'Despesa' : 'Receita'}
            </button>
          </div>
        ) : (
          filteredTransactions.map((transaction, index) => {
            const overdue = isTransactionOverdue(transaction);
            const daysUntilDue = transaction.dueDate ? getDaysUntilDue(transaction.dueDate) : null;
            
            return (
              <div
                key={`${transaction.id}-${index}`}
                className={`bg-white border rounded-xl p-4 hover:shadow-md transition-shadow ${
                  overdue ? 'border-red-300 bg-red-50' : 
                  !transaction.isPaid && type === 'expense' ? 'border-orange-200 bg-orange-50' :
                  'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-slate-900 truncate">
                        {transaction.description}
                      </h3>
                      {type === 'expense' && (
                        <button
                          onClick={() => onUpdatePaymentStatus(transaction.id, !transaction.isPaid)}
                          className={`p-1 rounded-full transition-colors flex-shrink-0 ${
                            transaction.isPaid 
                              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {transaction.isPaid ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-sm text-slate-600 mb-2">
                      <span className="bg-slate-100 px-2 py-1 rounded-full truncate max-w-[120px]">
                        {transaction.category}
                      </span>
                      
                      {/* Para receitas, mostrar data da transação */}
                      {type === 'income' && (
                        <span className="whitespace-nowrap">{formatBrazilDate(transaction.date)}</span>
                      )}
                      
                      {transaction.recurrence !== 'none' && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full whitespace-nowrap">
                          {transaction.recurrence === 'weekly' && 'Semanal'}
                          {transaction.recurrence === 'monthly' && 'Mensal'}
                          {transaction.recurrence === 'yearly' && 'Anual'}
                        </span>
                      )}
                    </div>

                    {/* Payment Status and Due Date Info */}
                    {type === 'expense' && (
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className={`px-2 py-1 rounded-full whitespace-nowrap ${
                          transaction.isPaid 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {transaction.isPaid ? '✓ Pago' : '⏳ Pendente'}
                        </span>
                        
                        {transaction.dueDate && (
                          <span className={`px-2 py-1 rounded-full flex items-center gap-1 whitespace-nowrap ${
                            overdue ? 'bg-red-100 text-red-700' :
                            daysUntilDue !== null && daysUntilDue <= 3 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
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
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`font-semibold text-sm sm:text-lg ${
                      type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(transaction.amount)}
                    </span>
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(transaction.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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