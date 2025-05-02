import mongoose, { Document, Schema } from 'mongoose';
import { generateInviteCode } from '../utils/generateInviteCode';

export interface SpaceDocument extends Document {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}

const workspaceSchema = new Schema<SpaceDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: false },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
      default: generateInviteCode,
    },
  },
  {
    timestamps: true,
  }
);

workspaceSchema.methods.resetInviteCode = function () {
  this.inviteCode = generateInviteCode();
};

const SpaceModel = mongoose.model<SpaceDocument>('Workspace', workspaceSchema);

export default SpaceModel;
