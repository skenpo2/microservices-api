import mongoose, { Document, Schema } from 'mongoose';
import { ProviderEnum, ProviderEnumType } from '../enums/account-provider.enum';
import {
  AccountTypeEnum,
  AccountTypeEnumType,
} from '../enums/account-type.enum';

export interface AccountDocument extends Document {
  provider: ProviderEnumType;
  providerId: string; //email or googleId
  userId: mongoose.Types.ObjectId;
  accountType: AccountTypeEnumType;
  createdAt: Date;
  updatedAt: Date;
  isVerified: Boolean;
}

const accountSchema = new Schema<AccountDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: String,
      enum: Object.values(ProviderEnum),
      required: true,
    },
    providerId: {
      type: String,
      unique: true,
      required: true,
    },
    accountType: {
      type: String,
      enum: Object.values(AccountTypeEnum),
      default: 'BASIC',
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const AccountModel = mongoose.model<AccountDocument>('Account', accountSchema);
export default AccountModel;
