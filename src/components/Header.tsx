import React, { useState } from 'react';
import { Link } from 'react-router-dom';


const Header: React.FC = () => {
  const [isPulsing, setIsPulsing] = useState(false);
  const appVersion = import.meta.env.APP_VERSION;

  const handleHeaderClick = () => {
    if (isPulsing) return;
    setIsPulsing(true);
    setTimeout(() => {
      setIsPulsing(false);
    }, 300); // Duração da animação
  };

  return (
    <header 
      className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg transition-transform duration-300 ease-in-out ${
        isPulsing ? 'scale-105' : 'scale-100'
      }`}
    >
      <Link to="/" onClick={handleHeaderClick} className="block cursor-pointer">
        <div className="max-w-md mx-auto relative h-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-bold">💰 Controle Financeiro</h1>
            <p className="text-blue-100 text-sm mt-1">
              Elisa, te amamos! | v{appVersion} 🚀
            </p>
          </div>
          <div
            className="absolute top-1/2 -translate-y-1/2 right-0 bg-blue-400 text-2xl text-white w-12 h-12 flex items-center justify-center rounded-full shadow-md"
            aria-label="Ir para a página inicial"
          >
            🏠
          </div>
        </div>
      </Link>
    </header>
  );
};

export default Header;
