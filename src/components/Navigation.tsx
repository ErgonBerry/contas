import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingDown, TrendingUp, BarChart3, Target, Calendar, Settings, Menu, X } from 'lucide-react';
import useWindowSize from '../hooks/useWindowSize';

const Navigation: React.FC = () => {
  const { width } = useWindowSize();
  const isLargeScreen = width && width >= 1024; // Define your breakpoint for large screens
  const [isMenuOpen, setIsMenuOpen] = useState(isLargeScreen); // Initialize based on screen size
  const location = useLocation();
  const activeTab = location.pathname;

  useEffect(() => {
    if (isLargeScreen) {
      setIsMenuOpen(true); // Always expand on large screens
    } else {
      setIsMenuOpen(false); // Collapse on small screens
    }
  }, [isLargeScreen]);

  const toggleMenu = () => {
    if (!isLargeScreen) { // Only allow toggling on small screens
      setIsMenuOpen(prev => !prev);
    }
  };

  const handleLinkClick = () => {
    if (!isLargeScreen) { // Only collapse on small screens after click
      setIsMenuOpen(false);
    }
  };

  const tabs = [
    { id: '/', label: 'Resumo', icon: Home },
    { id: '/expenses', label: 'Gastos', icon: TrendingDown },
    { id: '/income', label: 'Receitas', icon: TrendingUp },
    { id: '/calendar', label: 'Agenda', icon: Calendar },
    { id: '/reports', label: 'Relatórios', icon: BarChart3 },
    { id: '/goals', label: 'Metas', icon: Target },
    { id: '/settings', label: 'Config', icon: Settings },
  ];

  const menuClasses = `
    fixed top-0 left-0 h-full bg-white border-r border-slate-200 p-2 flex flex-col justify-start pt-20
    transition-all duration-300 ease-in-out z-40
    ${isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
    ${isLargeScreen ? 'lg:translate-x-0 lg:opacity-100 lg:relative lg:pt-4 lg:shadow-none lg:border-none' : ''}
  `;

  return (
    <>
      {!isLargeScreen && ( // Only show button on small screens
        <button
          onClick={toggleMenu}
          className={`fixed top-4 left-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all duration-300 ease-in-out z-50 ${
            !isMenuOpen ? 'animate-pulse' : ''
          }`}
          aria-label="Abrir menu"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {!isLargeScreen && isMenuOpen && ( // Only show overlay on small screens when menu is open
        <div
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-25 z-30 transition-opacity duration-300 ease-in-out"
        />
      )}

      <nav className={menuClasses}>
        <div className="flex flex-col items-start gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Link
                key={tab.id}
                to={tab.id}
                onClick={handleLinkClick}
                className={`flex flex-row items-center gap-3 py-2 px-4 rounded-lg w-full text-left transition-all ${
                  isActive 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className="text-sm font-semibold">
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navigation;

