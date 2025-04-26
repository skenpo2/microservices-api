import mongoose, { Schema, Document } from 'mongoose';

export interface IPassword extends Document {
  email: string;
  expiresAt: Date;
}

const passwordSchema = new Schema<IPassword>({
  email: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

passwordSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired tokens

const PasswordResetTokenModel = mongoose.model<IPassword>(
  'PasswordResetToken',
  passwordSchema
);
export default PasswordResetTokenModel;
