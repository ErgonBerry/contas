import React from 'react';
import { Home, TrendingDown, TrendingUp, BarChart3, Target, Calendar, Settings } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'Resumo', icon: Home },
    { id: 'expenses', label: 'Gastos', icon: TrendingDown },
    { id: 'income', label: 'Receitas', icon: TrendingUp },
    { id: 'calendar', label: 'Agenda', icon: Calendar },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'goals', label: 'Metas', icon: Target },
    { id: 'settings', label: 'Config', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-1 py-2 z-40">
      <div className="flex justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all ${
                isActive 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-xs font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;