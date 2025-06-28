
import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  id: string;
  title: string;
  amount: number;
  category: string;
  dueDate: Date;
  recurring: boolean;
  recurrenceType?: 'monthly' | 'weekly' | 'yearly';
  paid: boolean;
  description?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  dueDate: { type: Date, required: true },
  recurring: { type: Boolean, default: false },
  recurrenceType: { type: String, enum: ['monthly', 'weekly', 'yearly'] },
  paid: { type: Boolean, default: false },
  description: { type: String },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IExpense>('Expense', ExpenseSchema);
