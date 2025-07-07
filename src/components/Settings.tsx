import React, { useState } from 'react';
import { Transaction, SavingsGoal } from '../types';
import { exportFinancialData, validateImportData, getCurrentBrazilDate, formatBrazilDate } from '../utils/helpers';
import { Settings as SettingsIcon, Download, Upload, Trash2, AlertTriangle, CheckCircle, FileText } from 'lucide-react';

interface SettingsProps {
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  onImportData: (transactions: Transaction[], savingsGoals: SavingsGoal[]) => void;
  onClearAllData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  transactions, 
  savingsGoals, 
  onImportData, 
  onClearAllData 
}) => {
  const [importText, setImportText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');

  const handleExport = () => {
    const exportData = exportFinancialData(transactions, savingsGoals);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financeiro-backup-${formatBrazilDate(getCurrentBrazilDate(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importText.trim()) {
      setImportStatus('error');
      setImportMessage('Por favor, cole os dados JSON para importar.');
      return;
    }

    const validatedData = validateImportData(importText);
    
    if (!validatedData) {
      setImportStatus('error');
      setImportMessage('Dados inválidos. Verifique se o arquivo JSON está correto.');
      return;
    }

    onImportData(validatedData.transactions, validatedData.savingsGoals);
    setImportStatus('success');
    setImportMessage(`Importação realizada com sucesso! ${validatedData.transactions.length} transações e ${validatedData.savingsGoals.length} metas importadas.`);
    
    setTimeout(() => {
      setShowImportModal(false);
      setImportText('');
      setImportStatus('idle');
      setImportMessage('');
    }, 2000);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportText(content);
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    onClearAllData();
    setShowClearModal(false);
  };

  const totalTransactions = transactions.length;
  const totalGoals = savingsGoals.length;

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Configurações
        </h1>
        <p className="text-slate-600">
          Gerencie seus dados e configurações
        </p>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">
            Gerenciamento de Dados
          </h2>
        </div>

        <div className="space-y-4">
          {/* Export */}
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
            <div>
              <h3 className="font-medium text-slate-900 mb-1">
                Exportar Dados
              </h3>
              <p className="text-sm text-slate-600">
                Baixe um backup de todas as suas transações e metas
              </p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>

          {/* Import */}
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
            <div>
              <h3 className="font-medium text-slate-900 mb-1">
                Importar Dados
              </h3>
              <p className="text-sm text-slate-600">
                Restaure seus dados de um backup anterior
              </p>
            </div>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              Importar
            </button>
          </div>

          {/* Clear All Data */}
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h3 className="font-medium text-red-900 mb-1">
                Limpar Todos os Dados
              </h3>
              <p className="text-sm text-red-700">
                Remove permanentemente todas as transações e metas
              </p>
            </div>
            <button
              onClick={() => setShowClearModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Limpar Tudo
            </button>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-slate-100 rounded-lg">
            <SettingsIcon className="w-5 h-5 text-slate-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">
            Sobre o App
          </h2>
        </div>
        
        <div className="space-y-3 text-sm text-slate-600">
          <p>
            <strong>Controle Financeiro</strong> - Versão 1.0
          </p>
          <p>
            Os dados são armazenados localmente no seu navegador e não são enviados para nenhum servidor externo.
          </p>
          <p>
            Para não perder seus dados, faça backups regulares usando a função de exportar.
          </p>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-medium mb-1">💡 Nova Funcionalidade: Recorrência Inteligente</p>
            <p className="text-blue-700 text-xs">
              Transações marcadas como recorrentes (semanal, mensal, anual) são automaticamente calculadas no calendário e relatórios.
            </p>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800">
                Importar Dados
              </h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportText('');
                  setImportStatus('idle');
                  setImportMessage('');
                }}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Selecionar arquivo de backup
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="text-center text-slate-500">ou</div>

              {/* Text Import */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cole os dados JSON aqui
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Cole o conteúdo do arquivo JSON aqui..."
                  className="w-full h-40 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Status Message */}
              {importMessage && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  importStatus === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {importStatus === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                  <span className="text-sm">{importMessage}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportText('');
                    setImportStatus('idle');
                    setImportMessage('');
                  }}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleImport}
                  disabled={!importText.trim() || importStatus === 'success'}
                  className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                >
                  Importar Dados
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Data Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800">
                Confirmar Exclusão
              </h3>
            </div>

            <div className="mb-6">
              <p className="text-slate-700 mb-4">
                Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  <strong>Serão removidos:</strong>
                </p>
                <ul className="text-sm text-red-700 mt-1 list-disc list-inside">
                  <li>{totalTransactions} transações</li>
                  <li>{totalGoals} metas de economia</li>
                  <li>Todos os dados salvos</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleClearAllData}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
              >
                Sim, Limpar Tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;