import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'; // Assuming ui/dialog exists
import { Transaction } from '../types';
import { formatCurrency, formatBrazilDate, parseLocalDate } from '../utils/helpers';
import { TrendingUp, DollarSign, Check, Repeat, Tag, Calendar as CalendarIcon, Info, CreditCard } from 'lucide-react';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ transaction, isOpen, onClose }) => {
  if (!transaction) {
    return null;
  }

  const isExpense = transaction.type === 'expense';
  const isIncome = transaction.type === 'income';
  const isPaid = transaction.isPaid;
  const isRecurring = transaction.recurrence !== 'none';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
            {isIncome ? (
              <TrendingUp className="w-6 h-6 text-green-600" />
            ) : isPaid ? (
              <Check className="w-6 h-6 text-green-600" />
            ) : (
              <DollarSign className="w-6 h-6 text-orange-600" />
            )}
            {transaction.description}
          </DialogTitle>
          <DialogDescription className="text-slate-600 text-sm">
            Detalhes da transação.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-700 font-medium">Valor:</span>
            <span className={`font-bold text-xl ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
              {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-700 font-medium flex items-center gap-1"><Tag className="w-4 h-4" /> Categoria:</span>
            <span className="text-slate-800">{transaction.category}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-700 font-medium flex items-center gap-1"><CalendarIcon className="w-4 h-4" /> Data:</span>
            <span className="text-slate-800">{formatBrazilDate(parseLocalDate(transaction.date))}</span>
          </div>
          {isExpense && transaction.dueDate && (
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium flex items-center gap-1"><CreditCard className="w-4 h-4" /> Vencimento:</span>
              <span className="text-slate-800">{formatBrazilDate(parseLocalDate(transaction.dueDate))}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-slate-700 font-medium flex items-center gap-1"><Info className="w-4 h-4" /> Status:</span>
            <span className={`font-medium ${isPaid ? 'text-green-600' : 'text-red-600'}`}>
              {isPaid ? (isIncome ? 'Recebido' : 'Pago') : (isIncome ? 'A Receber' : 'Pendente')}
            </span>
          </div>
          {isRecurring && (
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium flex items-center gap-1"><Repeat className="w-4 h-4" /> Recorrência:</span>
              <span className="text-slate-800 capitalize">{transaction.recurrence}</span>
            </div>
          )}
          {transaction.notes && (
            <div>
              <span className="text-slate-700 font-medium flex items-center gap-1 mb-1"><Info className="w-4 h-4" /> Observações:</span>
              <p className="text-slate-800 bg-slate-50 p-3 rounded-md whitespace-pre-wrap">{transaction.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailModal;
