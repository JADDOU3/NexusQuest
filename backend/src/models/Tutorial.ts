import mongoose, { Document, Schema } from 'mongoose';

export interface ITutorial extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  language: string;
  content: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  createdBy: mongoose.Types.ObjectId;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const tutorialSchema = new Schema<ITutorial>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    order: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Tutorial = mongoose.model<ITutorial>('Tutorial', tutorialSchema);

export default Tutorial;
