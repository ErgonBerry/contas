
import { Router } from 'express';
import Expense from '../models/Expense';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: (err as any).message });
  }
});

router.post('/', async (req, res) => {
  const expense = new Expense({
    id: req.body.id,
    title: req.body.title,
    amount: req.body.amount,
    category: req.body.category,
    dueDate: req.body.dueDate,
    recurring: req.body.recurring,
    recurrenceType: req.body.recurrenceType,
    paid: req.body.paid,
    description: req.body.description,
    createdBy: req.body.createdBy,
    createdAt: req.body.createdAt,
    updatedAt: req.body.updatedAt,
  });

  try {
    const newExpense = await expense.save();
    res.status(201).json(newExpense);
  } catch (err) {
    res.status(400).json({ message: (err as any).message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({ id: req.params.id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.title = req.body.title;
    expense.amount = req.body.amount;
    expense.category = req.body.category;
    expense.dueDate = req.body.dueDate;
    expense.recurring = req.body.recurring;
    expense.recurrenceType = req.body.recurrenceType;
    expense.paid = req.body.paid;
    expense.description = req.body.description;
    expense.createdBy = req.body.createdBy;
    expense.updatedAt = new Date();

    const updatedExpense = await expense.save();
    res.json(updatedExpense);
  } catch (err) {
    res.status(400).json({ message: (err as any).message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ id: req.params.id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: (err as any).message });
  }
});

export default router;
