import React, { useState } from 'react';
import { User, Download, Upload, Trash2, Bell, Moon, Sun, Smartphone, Save } from 'lucide-react';

interface SettingsProps {
  currentUser: string;
  onUserChange: (user: string) => void;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

const defaultProfiles: Record<string, UserProfile> = {
  usuario1: {
    id: 'usuario1',
    name: 'Rodolfo',
    email: 'rodolfotiago@gmail.com',
  },
  usuario2: {
    id: 'usuario2',
    name: 'Thaís',
    email: 'thaiscarvalho1988@hotmail.com',
  },
};

export function Settings({ currentUser, onUserChange }: SettingsProps) {
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>(defaultProfiles);
  const [notifications, setNotifications] = useState({
    dueReminders: true,
    weeklyReports: false,
    monthlyReports: true,
    overdueAlerts: true,
  });
  const [preferences, setPreferences] = useState({
    theme: 'light',
    currency: 'BRL',
    dateFormat: 'dd/mm/yyyy',
    startOfWeek: 'sunday',
  });
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [tempProfile, setTempProfile] = useState<UserProfile | null>(null);

  const handleProfileEdit = (userId: string) => {
    setEditingProfile(userId);
    setTempProfile({ ...profiles[userId] });
  };

  const handleProfileSave = () => {
    if (editingProfile && tempProfile) {
      setProfiles(prev => ({
        ...prev,
        [editingProfile]: tempProfile,
      }));
      setEditingProfile(null);
      setTempProfile(null);
    }
  };

  const handleProfileCancel = () => {
    setEditingProfile(null);
    setTempProfile(null);
  };

  const handleExportData = () => {
    const data = {
      expenses: JSON.parse(localStorage.getItem('household-expenses') || '[]'),
      profiles,
      settings: { notifications, preferences },
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contas-casa-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.expenses) {
          localStorage.setItem('household-expenses', JSON.stringify(data.expenses));
        }
        
        if (data.profiles) {
          setProfiles(data.profiles);
        }
        
        if (data.settings) {
          if (data.settings.notifications) {
            setNotifications(data.settings.notifications);
          }
          if (data.settings.preferences) {
            setPreferences(data.settings.preferences);
          }
        }
        
        alert('Dados importados com sucesso!');
        window.location.reload();
      } catch (error) {
        alert('Erro ao importar dados. Verifique se o arquivo está correto.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (window.confirm('Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.')) {
      localStorage.removeItem('household-expenses');
      alert('Dados apagados com sucesso!');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-taupe_gray-800 mb-2">
          Configurações
        </h2>
        <p className="text-taupe_gray-600">
          Gerencie suas preferências e dados do sistema
        </p>
      </div>

      {/* User Profiles */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-taupe_gray-800 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Perfis de Usuário
        </h3>
        
        <div className="space-y-4">
          {Object.values(profiles).map(profile => (
            <div key={profile.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              {editingProfile === profile.id ? (
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={tempProfile?.name || ''}
                    onChange={(e) => setTempProfile(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea_green-500"
                    placeholder="Nome"
                  />
                  <input
                    type="email"
                    value={tempProfile?.email || ''}
                    onChange={(e) => setTempProfile(prev => prev ? { ...prev, email: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea_green-500"
                    placeholder="Email"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleProfileSave}
                      className="px-3 py-1 bg-tea_green-500 text-white rounded-lg text-sm hover:bg-tea_green-600 transition-colors"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={handleProfileCancel}
                      className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentUser === profile.id ? 'bg-tea_green-100' : 'bg-gray-200'
                    }`}>
                      <User className={`w-5 h-5 ${
                        currentUser === profile.id ? 'text-tea_green-600' : 'text-gray-500'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-taupe_gray-800">{profile.name}</p>
                      <p className="text-sm text-taupe_gray-500">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {currentUser !== profile.id && (
                      <button
                        onClick={() => onUserChange(profile.id)}
                        className="px-3 py-1 bg-cambridge_blue-100 text-cambridge_blue-700 rounded-lg text-sm hover:bg-cambridge_blue-200 transition-colors"
                      >
                        Usar
                      </button>
                    )}
                    <button
                      onClick={() => handleProfileEdit(profile.id)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                    >
                      Editar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-taupe_gray-800 mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Notificações
        </h3>
        
        <div className="space-y-4">
          {Object.entries({
            dueReminders: 'Lembrete de vencimento (3 dias antes)',
            weeklyReports: 'Relatório semanal',
            monthlyReports: 'Relatório mensal',
            overdueAlerts: 'Alertas de contas vencidas',
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-taupe_gray-700">{label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[key as keyof typeof notifications]}
                  onChange={(e) => setNotifications(prev => ({
                    ...prev,
                    [key]: e.target.checked,
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-tea_green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tea_green-500"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-taupe_gray-800 mb-4 flex items-center">
          <Smartphone className="w-5 h-5 mr-2" />
          Preferências
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-taupe_gray-700 mb-2">
              Tema
            </label>
            <select
              value={preferences.theme}
              onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea_green-500"
            >
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
              <option value="auto">Automático</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-taupe_gray-700 mb-2">
              Moeda
            </label>
            <select
              value={preferences.currency}
              onChange={(e) => setPreferences(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea_green-500"
            >
              <option value="BRL">Real (R$)</option>
              <option value="USD">Dólar ($)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-taupe_gray-700 mb-2">
              Formato de Data
            </label>
            <select
              value={preferences.dateFormat}
              onChange={(e) => setPreferences(prev => ({ ...prev, dateFormat: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea_green-500"
            >
              <option value="dd/mm/yyyy">DD/MM/AAAA</option>
              <option value="mm/dd/yyyy">MM/DD/AAAA</option>
              <option value="yyyy-mm-dd">AAAA-MM-DD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-taupe_gray-800 mb-4">
          Gerenciamento de Dados
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-taupe_gray-800">Exportar Dados</p>
              <p className="text-sm text-taupe_gray-600">
                Baixe um backup de todas as suas contas e configurações
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="flex items-center space-x-2 px-4 py-2 bg-cambridge_blue-500 text-white rounded-lg hover:bg-cambridge_blue-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-taupe_gray-800">Importar Dados</p>
              <p className="text-sm text-taupe_gray-600">
                Restaure seus dados de um arquivo de backup
              </p>
            </div>
            <label className="flex items-center space-x-2 px-4 py-2 bg-tea_green-500 text-white rounded-lg hover:bg-tea_green-600 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Importar</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <p className="font-medium text-red-800">Apagar Todos os Dados</p>
              <p className="text-sm text-red-600">
                Remove permanentemente todas as contas e configurações
              </p>
            </div>
            <button
              onClick={handleClearData}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Apagar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}