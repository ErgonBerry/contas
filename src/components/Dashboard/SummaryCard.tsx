import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function SummaryCard({ title, value, icon: Icon, color, trend }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <span className={`text-xs font-medium ${
            trend.isPositive ? 'text-tea_green-600' : 'text-red-500'
          }`}>
            {trend.value}
          </span>
        )}
      </div>
      
      <div>
        <p className="text-2xl font-bold text-taupe_gray-900">{value}</p>
        <p className="text-sm text-taupe_gray-600 mt-1">{title}</p>
      </div>
    </div>
  );
}