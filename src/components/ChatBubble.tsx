import React from 'react';
import { X } from 'lucide-react';

interface ChatBubbleProps {
  message: string;
  type: 'positive' | 'neutral' | 'alert';
  onClose: () => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, type, onClose }) => {
  let bgColorClass = '';
  let textColorClass = '';

  switch (type) {
    case 'positive':
      bgColorClass = 'bg-green-500';
      textColorClass = 'text-white';
      break;
    case 'neutral':
      bgColorClass = 'bg-gray-500';
      textColorClass = 'text-white';
      break;
    case 'alert':
      bgColorClass = 'bg-red-500';
      textColorClass = 'text-white';
      break;
    default:
      bgColorClass = 'bg-gray-500';
      textColorClass = 'text-white';
  }

  return (
    <div className={`relative p-3 rounded-lg shadow-md ${bgColorClass} ${textColorClass} text-sm max-w-xs`} style={{ minWidth: '150px' }}>
      <p>{message}</p>
      <button
        onClick={onClose}
        className="absolute top-1 right-1 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
        aria-label="Fechar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ChatBubble;
