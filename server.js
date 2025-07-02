import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

// Helper function to convert YYYY-MM-DD string to a UTC Date object at the start of the day
const createLocalDateForStorage = (dateString) => {
  if (!dateString) return undefined;
  const [year, month, day] = dateString.split('-').map(Number);
  // Create a Date object in local time (Brazil) at noon to avoid timezone issues
  return new Date(year, month - 1, day, 12, 0, 0);
};

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas e Models

// Schema para as contribuições dentro de uma meta de poupança
const savingsContributionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
}, {
  timestamps: true, // Adiciona createdAt e updatedAt
  _id: true, // Garante que cada contribuição tenha um ID
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  },
  toObject: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

const transactionSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  category: { type: String, required: true },
  date: { type: Date, required: true },
  dueDate: { type: Date },
  isPaid: { type: Boolean, default: false },
  recurrence: {
    type: String,
    enum: ['none', 'weekly', 'monthly', 'yearly'],
    default: 'none'
  },
  notes: { type: String, trim: true }
}, {
  timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  },
  toObject: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

const savingsGoalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  deadline: { type: Date },
  contributions: [savingsContributionSchema] // Array de contribuições
}, {
  timestamps: true, // Adiciona createdAt e updatedAt
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  },
  toObject: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
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
  const transactionData = {
    ...req.body,
    date: createLocalDateForStorage(req.body.date),
    dueDate: req.body.dueDate ? createLocalDateForStorage(req.body.dueDate) : undefined,
  };
  const transaction = new Transaction(transactionData);
  try {
    const newTransaction = await transaction.save();
    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/transactions/:id', async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      date: createLocalDateForStorage(req.body.date),
      dueDate: req.body.dueDate ? createLocalDateForStorage(req.body.dueDate) : undefined,
    };
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true } // new: true retorna o documento atualizado
    );
    if (!updatedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(updatedTransaction);
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
  const goalData = {
    ...req.body,
    deadline: req.body.deadline ? createLocalDateForStorage(req.body.deadline) : undefined,
  };
  const goal = new SavingsGoal(goalData);
  try {
    const newGoal = await goal.save();
    res.status(201).json(newGoal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/goals/:id', async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      deadline: req.body.deadline ? createLocalDateForStorage(req.body.deadline) : undefined,
    };
    const updatedGoal = await SavingsGoal.findByIdAndUpdate(
      req.params.id, 
      updateData, 
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

// Rota para adicionar uma contribuição a uma meta de poupança
app.post('/api/goals/:id/contributions', async (req, res) => {
  try {
    const goal = await SavingsGoal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }

    const { amount, date } = req.body;
    const contribution = {
      amount,
      date: date ? createLocalDateForStorage(date) : new Date(), // Usa a data atual se não for fornecida
    };

    goal.contributions.push(contribution);
    goal.currentAmount += amount;

    const updatedGoal = await goal.save();
    res.status(201).json(updatedGoal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Rota para atualizar uma contribuição
app.put('/api/goals/:goalId/contributions/:contributionId', async (req, res) => {
  try {
    const goal = await SavingsGoal.findById(req.params.goalId);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const contribution = goal.contributions.id(req.params.contributionId);
    if (!contribution) {
      return res.status(404).json({ message: 'Contribution not found' });
    }

    const oldAmount = contribution.amount;
    const newAmount = req.body.amount;

    contribution.amount = newAmount;
    contribution.date = req.body.date;

    goal.currentAmount = goal.currentAmount - oldAmount + newAmount;

    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rota para deletar uma contribuição
app.delete('/api/goals/:goalId/contributions/:contributionId', async (req, res) => {
  try {
    const goal = await SavingsGoal.findById(req.params.goalId);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const contribution = goal.contributions.id(req.params.contributionId);
    if (!contribution) {
      return res.status(404).json({ message: 'Contribution not found' });
    }

    goal.currentAmount -= contribution.amount;
    goal.contributions.pull(req.params.contributionId);

    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});