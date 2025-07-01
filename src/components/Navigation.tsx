import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingDown, TrendingUp, BarChart3, Target, Calendar, Settings } from 'lucide-react';

interface NavigationProps {
  menuPosition: 'bottom' | 'side';
}

const Navigation: React.FC<NavigationProps> = ({ menuPosition }) => {
  const location = useLocation();
  const activeTab = location.pathname;

  const tabs = [
    { id: '/', label: 'Resumo', icon: Home },
    { id: '/expenses', label: 'Gastos', icon: TrendingDown },
    { id: '/income', label: 'Receitas', icon: TrendingUp },
    { id: '/calendar', label: 'Agenda', icon: Calendar },
    { id: '/reports', label: 'Relatórios', icon: BarChart3 },
    { id: '/goals', label: 'Metas', icon: Target },
    { id: '/settings', label: 'Config', icon: Settings },
  ];

  const baseClasses = "transition-all duration-300 ease-in-out z-40";
  const positionClasses = {
    bottom: "fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-1 py-2",
    side: "fixed top-0 left-0 h-full bg-white border-r border-slate-200 p-2 flex flex-col justify-start pt-20",
  };

  const containerClasses = {
    bottom: "flex justify-around max-w-md mx-auto",
    side: "flex flex-col items-start gap-4",
  };

  const linkClasses = {
    bottom: "flex-col items-center gap-1 py-2 px-1 rounded-xl",
    side: "flex-row items-center gap-3 py-2 px-4 rounded-lg w-full text-left",
  };

  const iconClasses = {
    bottom: "w-4 h-4",
    side: "w-5 h-5",
  };

  const labelClasses = {
    bottom: "text-xs font-medium",
    side: "text-sm font-semibold",
  };

  return (
    <nav className={`${baseClasses} ${positionClasses[menuPosition]}`}>
      <div className={containerClasses[menuPosition]}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Link
              key={tab.id}
              to={tab.id}
              className={`flex transition-all ${linkClasses[menuPosition]} ${
                isActive 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className={`${iconClasses[menuPosition]} ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className={labelClasses[menuPosition]}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;