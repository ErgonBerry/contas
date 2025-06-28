
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri =  "mongodb+srv://rodolfoneto:iso900222@cluster0.u8x8t.mongodb.net/household_db?retryWrites=true&w=majority";
if (!uri) {
  console.error('MONGO_URI is not defined in the environment variables');
  process.exit(1);
}

mongoose.connect(uri);

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

import expenseRouter from './routes/expenses';
app.use('/api/expenses', expenseRouter);


app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
