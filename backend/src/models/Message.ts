import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
    sender: mongoose.Types.ObjectId;
    recipient: mongoose.Types.ObjectId;
    content: string;
    readAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
    {
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        recipient: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
        readAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);