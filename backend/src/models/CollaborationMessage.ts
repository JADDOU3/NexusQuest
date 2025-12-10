import mongoose, { Document, Schema } from 'mongoose';

export interface ICollaborationMessage extends Document {
  sessionId: string;
  userId: mongoose.Types.ObjectId;
  username: string;
  message: string;
  type: 'text' | 'system' | 'code' | 'file';
  metadata?: {
    language?: string;
    fileName?: string;
    lineNumber?: number;
  };
  createdAt: Date;
}

const CollaborationMessageSchema = new Schema<ICollaborationMessage>(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['text', 'system', 'code', 'file'],
      default: 'text',
    },
    metadata: {
      language: String,
      fileName: String,
      lineNumber: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient message retrieval
CollaborationMessageSchema.index({ sessionId: 1, createdAt: -1 });

// TTL index to auto-delete messages after 7 days
CollaborationMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

export const CollaborationMessage = mongoose.model<ICollaborationMessage>(
  'CollaborationMessage',
  CollaborationMessageSchema
);
