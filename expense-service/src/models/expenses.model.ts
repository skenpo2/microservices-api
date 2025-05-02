import mongoose, { Document, Schema } from 'mongoose';

export interface ExpenseDocument extends Document {
  userId: string;
  title: string;
  amount: Number;
  categoryId: string;
  date: Date;
  notes: string;
  createdAt: Date;
  spaceId: string;
}

const expenseSchema = new Schema<ExpenseDocument>(
  {
    userId: {
      type: String,
      trim: true,
      required: true,
    },
    title: {
      type: String,
      trim: true,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    categoryId: {
      type: String,
      trim: true,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      required: true,
    },
    spaceId: {
      type: String,
      trim: true,
      required: true,
    },
  },
  { timestamps: true }
);

const ExpenseModel = mongoose.model<ExpenseDocument>('Expense', expenseSchema);

export default ExpenseModel;
