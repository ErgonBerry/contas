import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg">
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-bold text-center">💰 Controle Financeiro</h1>
        <p className="text-blue-100 text-sm text-center mt-1">
          Rodolfo & Thaís
        </p>
      </div>
    </header>
  );
};

export default Header;
