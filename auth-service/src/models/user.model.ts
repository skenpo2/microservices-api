import mongoose, { Schema, Document } from 'mongoose';
import argon2 from 'argon2';
import { comparePassword, hashPassword } from '../utils/argonPassword';

export interface UserDocument extends Document {
  name: string;
  email: string;
  password?: string;
  profilePicture: string | null;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  currentSpace: string;
  verifyPassword(value: string): Promise<boolean>;
  omitPassword(): Omit<UserDocument, 'password'>;
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, select: true },
    profilePicture: {
      type: String,
      default: null,
    },
    currentSpace: {
      type: String,
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (this.isModified('password'))
    if (this.password) {
      this.password = await hashPassword(this.password);
    }
  next();
});

userSchema.methods.omitPassword = function (): Omit<UserDocument, 'password'> {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

userSchema.methods.verifyPassword = async function (candidatePassword: string) {
  return comparePassword(this.password, candidatePassword);
  // try {
  //   const isValid = argon2.verify(this.password, candidatePassword);
  //   return isValid;
  // } catch (error) {
  //   throw error;
  // }
};

const UserModel = mongoose.model<UserDocument>('User', userSchema);
export default UserModel;
