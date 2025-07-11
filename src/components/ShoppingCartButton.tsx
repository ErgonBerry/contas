import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface ShoppingCartButtonProps {
  itemCount: number;
  onClick: () => void;
  theme: any; // Adjust type as per your ThemeContext
  className?: string; // Add className prop
  animateShake?: boolean; // New prop for animation
}

const ShoppingCartButton: React.FC<ShoppingCartButtonProps> = ({
  itemCount,
  onClick,
  theme,
  className,
  animateShake
}) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-full shadow-lg flex items-center justify-center ${className} ${animateShake ? 'animate-shake' : ''}`}
      style={{
        backgroundColor: theme.cardBackground,
        color: theme.text,
      }}
    >
      <ShoppingCart size={20} />
      {itemCount > 0 && (
        <span
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
        >
          {itemCount}
        </span>
      )}
    </button>
  );
};

export default ShoppingCartButton;
