import mongoose, { Document, mongo, Schema } from 'mongoose';
import {
  InvoiceStatusEnum,
  InvoiceStatusEnumType,
} from '../enums/invoice-status.enums';

export interface InvoiceDocument extends Document {
  userId: string;
  spaceId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  items: [
    {
      description: string;
      quantity: Number;
      unitPrice: Number;
    }
  ];
  totalAmount: Number;
  status: InvoiceStatusEnumType;
  dueDate: Date;
  createdAt: Date;
}

const invoiceSchema = new Schema<InvoiceDocument>(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    spaceId: {
      type: String,
      required: true,
      trim: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    clientEmail: {
      type: String,
      trim: true,
    },
    clientPhone: {
      type: String,
      trim: true,
    },
    items: [
      {
        description: String,
        quantity: Number,
        unitPrice: Number,
      },
    ],

    totalAmount: Number,
    status: {
      type: String,
      enum: Object.values(InvoiceStatusEnum),
      default: 'PENDING',
    },
    dueDate: Date,
    createdAt: Date,
  },
  { timestamps: true }
);

const InvoiceModel = mongoose.model<InvoiceDocument>('Invoice', invoiceSchema);

export default InvoiceModel;
