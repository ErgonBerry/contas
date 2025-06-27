import { ExpenseCategory } from '../types/expense';

export const categoryLabels: Record<ExpenseCategory, string> = {
  housing: 'Moradia',
  utilities: 'Utilidades',
  internet: 'Internet',
  food: 'Alimentação',
  transport: 'Transporte',
  healthcare: 'Saúde',
  entertainment: 'Entretenimento',
  shopping: 'Compras',
  education: 'Educação',
  other: 'Outros',
};

export const categoryColors: Record<ExpenseCategory, string> = {
  housing: 'bg-tea_green-500',
  utilities: 'bg-celadon-500',
  internet: 'bg-cambridge_blue-500',
  food: 'bg-taupe_gray-500',
  transport: 'bg-chinese_violet-500',
  healthcare: 'bg-tea_green-600',
  entertainment: 'bg-celadon-600',
  shopping: 'bg-cambridge_blue-600',
  education: 'bg-taupe_gray-600',
  other: 'bg-chinese_violet-600',
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}