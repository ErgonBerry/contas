import React from 'react';
import { Menu, Plus, User } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  onAddClick: () => void;
  currentUser: string;
  onUserChange: (user: string) => void;
}

export function Header({ onMenuClick, onAddClick, currentUser, onUserChange }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-taupe_gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-taupe_gray-800">
                Contas da Casa
              </h1>
              <select
              value={currentUser}
              onChange={(e) => onUserChange(e.target.value)}
              className="text-xs bg-cambridge_blue-50 border border-cambridge_blue-200 rounded-lg px-2 py-1 text-cambridge_blue-700 focus:outline-none focus:ring-2 focus:ring-cambridge_blue-300"
            >
              <option value="usuario1">Rodolfo</option>
              <option value="usuario2">Thaís</option>
            </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            
            
            <button
              onClick={onAddClick}
              className="bg-tea_green-600 hover:bg-tea_green-600 text-white p-2 rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}