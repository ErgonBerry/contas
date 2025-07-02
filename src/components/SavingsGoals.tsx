import React, { useState } from 'react';
import { SavingsGoal, SavingsContribution } from '../types';
import { formatCurrency, formatBrazilDate, getBrazilDateString } from '../utils/helpers';
import { Target, Plus, Trash2, Edit3, Calendar, TrendingUp, History, X } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  onAdd: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, updates: Partial<SavingsGoal>) => void;
  onDelete: (id: string) => void;
  onAddContribution: (goalId: string, amount: number, date?: string) => void;
  onUpdateContribution: (goalId: string, contributionId: string, updates: Partial<SavingsContribution>) => void;
  onDeleteContribution: (goalId: string, contributionId: string) => void;
}

const SavingsGoals: React.FC<SavingsGoalsProps> = ({ 
  goals, 
  onAdd, 
  onUpdate, 
  onDelete, 
  onAddContribution,
  onUpdateContribution,
  onDeleteContribution
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);

  const openDeleteModal = (id: string) => {
    setGoalToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setGoalToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (goalToDelete) {
      onDelete(goalToDelete);
    }
    closeDeleteModal();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.targetAmount) {
      return;
    }

    const goalData = {
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: 0, // Always start with 0, contributions will be added separately
      deadline: formData.deadline || undefined,
      contributions: [], // Initialize with empty contributions
    };

    if (editingGoal) {
      onUpdate(editingGoal, goalData);
      setEditingGoal(null);
    } else {
      onAdd(goalData);
    }

    setFormData({ name: '', targetAmount: '', deadline: '' });
    setShowForm(false);
  };

  const handleEdit = (goal: SavingsGoal) => {
    const deadline = goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '';
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      deadline: deadline,
    });
    setEditingGoal(goal.id);
    setShowForm(true);
  };

  const totalGoals = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-slate-800 mb-1 truncate">
            Metas de Economia
          </h2>
          {goals.length > 0 && (
            <p className="text-sm text-slate-600 truncate">
              Total: <span className="font-medium">{formatCurrency(totalSaved)} / {formatCurrency(totalGoals)}</span>
            </p>
          )}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="p-3 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg transition-all hover:scale-105 flex-shrink-0"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Target className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 mb-4">Nenhuma meta cadastrada</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors"
            >
              Criar primeira meta
            </button>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const isComplete = progress >= 100;
            
            return (
              <GoalCard 
                key={goal.id}
                goal={goal}
                progress={progress}
                isComplete={isComplete}
                onEdit={() => handleEdit(goal)}
                onDelete={() => openDeleteModal(goal.id)}
                onAddContribution={onAddContribution}
                onUpdateContribution={onUpdateContribution}
                onDeleteContribution={onDeleteContribution}
              />
            );
          })
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800 truncate pr-2">
                {editingGoal ? 'Editar Meta' : 'Nova Meta'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingGoal(null);
                  setFormData({ name: '', targetAmount: '', deadline: '' });
                }}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nome da Meta
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Viagem para o Japão"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Valor da Meta (R$)
                </label>
                <input
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Prazo (Opcional)
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingGoal(null);
                    setFormData({ name: '', targetAmount: '', deadline: '' });
                  }}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors"
                >
                  {editingGoal ? 'Salvar' : 'Criar Meta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message="Tem certeza de que deseja excluir esta meta de economia? Esta ação não pode ser desfeita."
      />
    </div>
  );
};

// Goal Card Component
interface GoalCardProps {
  goal: SavingsGoal;
  progress: number;
  isComplete: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAddContribution: (goalId: string, amount: number, date?: string) => void;
  onUpdateContribution: (goalId: string, contributionId: string, updates: Partial<SavingsContribution>) => void;
  onDeleteContribution: (goalId: string, contributionId: string) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ 
  goal, 
  progress, 
  isComplete, 
  onEdit, 
  onDelete, 
  onAddContribution,
  onUpdateContribution,
  onDeleteContribution
}) => {
  const [showAddAmount, setShowAddAmount] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [contributionDate, setContributionDate] = useState(getBrazilDateString());
  const [editingContribution, setEditingContribution] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');

  const handleAddAmount = () => {
    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    onAddContribution(goal.id, amount, contributionDate);
    setAddAmount('');
    setContributionDate(getBrazilDateString());
    setShowAddAmount(false);
  };

  const handleEditContribution = (contribution: SavingsContribution) => {
    setEditingContribution(contribution.id);
    setEditAmount(contribution.amount.toString());
    const formattedDate = contribution.date ? new Date(contribution.date).toISOString().split('T')[0] : '';
    setEditDate(formattedDate);
  };

  const handleUpdateContribution = () => {
    if (!editingContribution) return;
    
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    onUpdateContribution(goal.id, editingContribution, {
      amount,
      date: editDate,
    });
    
    setEditingContribution(null);
    setEditAmount('');
    setEditDate('');
  };

  const handleDeleteContribution = (contributionId: string) => {
    if (confirm('Tem certeza que deseja excluir este aporte?')) {
      onDeleteContribution(goal.id, contributionId);
    }
  };

  const remainingAmount = goal.targetAmount - goal.currentAmount;

  // Sort contributions by date (most recent first)
  const sortedContributions = (goal.contributions || [])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className={`bg-white border rounded-2xl p-6 transition-all ${
      isComplete ? 'border-green-200 bg-green-50' : 'border-slate-200 hover:shadow-md'
    }`}>
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 mb-1 truncate">
            {goal.name}
          </h3>
          {goal.deadline && (
            <p className="text-sm text-slate-600 truncate">
              Prazo: {formatBrazilDate(new Date(goal.deadline))}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {sortedContributions.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 text-slate-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
              title="Ver histórico de aportes"
            >
              <History className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onEdit}
            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600 truncate pr-2">Progresso</span>
          <span className="font-medium flex-shrink-0">
            {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              isComplete ? 'bg-green-500' : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className={`font-medium ${isComplete ? 'text-green-600' : 'text-amber-600'}`}>
            {progress.toFixed(1)}%
          </span>
          {!isComplete && (
            <span className="text-slate-500 truncate pl-2">
              Faltam {formatCurrency(remainingAmount)}
            </span>
          )}
        </div>
      </div>

      {/* Contributions History */}
      {showHistory && sortedContributions.length > 0 && (
        <div className="mb-4 border-t pt-4">
          <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            Histórico Completo de Aportes
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {sortedContributions.map(contribution => (
              <div key={contribution.id} className="bg-slate-50 rounded-lg p-3">
                {editingContribution === contribution.id ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        step="0.01"
                        min="0"
                        className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateContribution}
                        className="flex-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => {
                          setEditingContribution(null);
                          setEditAmount('');
                          setEditDate('');
                        }}
                        className="flex-1 px-3 py-1 border border-slate-300 text-slate-600 rounded text-sm hover:bg-slate-100 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-slate-600 truncate pr-2">
                          {formatBrazilDate(new Date(contribution.date))}
                        </span>
                        <span className="font-medium text-green-600 flex-shrink-0">
                          +{formatCurrency(contribution.amount)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      <button
                        onClick={() => handleEditContribution(contribution)}
                        className="p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                        title="Editar aporte"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteContribution(contribution.id)}
                        className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Excluir aporte"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick History Preview (when not showing full history) */}
      {!showHistory && sortedContributions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            Últimos Aportes
          </h4>
          <div className="space-y-1">
            {sortedContributions.slice(0, 2).map(contribution => (
              <div key={contribution.id} className="flex justify-between text-xs bg-slate-50 rounded p-2">
                <span className="text-slate-600 truncate pr-2">
                  {formatBrazilDate(new Date(contribution.date))}
                </span>
                <span className="font-medium text-green-600 flex-shrink-0">
                  +{formatCurrency(contribution.amount)}
                </span>
              </div>
            ))}
            {sortedContributions.length > 2 && (
              <button
                onClick={() => setShowHistory(true)}
                className="w-full text-xs text-slate-500 hover:text-slate-700 text-center py-1 hover:bg-slate-100 rounded transition-colors"
              >
                Ver todos os {sortedContributions.length} aportes
              </button>
            )}
          </div>
        </div>
      )}

      {isComplete ? (
        <div className="text-center py-2">
          <span className="text-green-600 font-medium">🎉 Meta Concluída!</span>
        </div>
      ) : (
        <div className="space-y-3">
          {!showAddAmount ? (
            <button
              onClick={() => setShowAddAmount(true)}
              className="w-full py-2 px-4 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-sm font-medium"
            >
              Adicionar Aporte
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  placeholder="Valor"
                  step="0.01"
                  min="0"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddAmount}
                  disabled={!addAmount || parseFloat(addAmount) <= 0}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors text-sm flex-shrink-0"
                >
                  +
                </button>
                <button
                  onClick={() => {
                    setShowAddAmount(false);
                    setAddAmount('');
                    setContributionDate(getBrazilDateString());
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm flex-shrink-0"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <input
                  type="date"
                  value={contributionDate}
                  onChange={(e) => setContributionDate(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              
              <p className="text-xs text-slate-500">
                O valor será deduzido do saldo do mês correspondente à data selecionada
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SavingsGoals;