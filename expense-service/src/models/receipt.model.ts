import mongoose, { Document, Schema } from 'mongoose';

export interface ReceiptDocument extends Document {
  userId: String;
  invoiceId?: String;
  title: String;
  amount: Number;
  date: Date;
  issuedTo: String;
  createdAt: Date;
}

const receiptSchema = new Schema<ReceiptDocument>(
  {
    userId: {
      type: String,
      required: true,
    },
    invoiceId: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    issuedTo: String,
    createdAt: Date,
  },
  { timestamps: true }
);

const ReceiptModel = mongoose.model<ReceiptDocument>('Receipt', receiptSchema);

export default ReceiptModel;
