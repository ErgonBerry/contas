import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Conexão com MongoDB
mongoose.connect("mongodb+srv://rodolfoneto:iso900222@cluster0.u8x8t.mongodb.net/household_db?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas e Models
const transactionSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  type: String, // 'income' or 'expense'
  date: Date,
  category: String,
});

const savingsGoalSchema = new mongoose.Schema({
  name: String,
  targetAmount: Number,
  currentAmount: Number,
  dueDate: Date,
});

const Transaction = mongoose.model('Transaction', transactionSchema);
const SavingsGoal = mongoose.model('SavingsGoal', savingsGoalSchema);

// Rotas da API
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  const transaction = new Transaction(req.body);
  try {
    const newTransaction = await transaction.save();
    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/goals', async (req, res) => {
  try {
    const goals = await SavingsGoal.find();
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/goals', async (req, res) => {
  const goal = new SavingsGoal(req.body);
  try {
    const newGoal = await goal.save();
    res.status(201).json(newGoal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/goals/:id', async (req, res) => {
  try {
    const updatedGoal = await SavingsGoal.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    res.json(updatedGoal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/goals/:id', async (req, res) => {
  try {
    await SavingsGoal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Savings goal deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});