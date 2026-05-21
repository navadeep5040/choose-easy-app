import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant' | 'mentor';
  senderId?: mongoose.Types.ObjectId;
  senderName?: string;
  content: string;
  timestamp: Date;
}

export interface IChatSession extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'ai' | 'mentor';
  mentorId?: mongoose.Types.ObjectId;
  mentorUserId?: mongoose.Types.ObjectId;
  bookingId?: mongoose.Types.ObjectId;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: { type: String, enum: ['user', 'assistant', 'mentor'], required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  senderName: { type: String, required: false },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ChatSessionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['ai', 'mentor'], default: 'ai' },
  mentorId: { type: Schema.Types.ObjectId, ref: 'Mentor', required: false },
  mentorUserId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: false },
  title: { type: String, default: 'New Conversation' },
  messages: [MessageSchema],
}, { timestamps: true });

export default mongoose.models.ChatSession || mongoose.model<IChatSession>('ChatSession', ChatSessionSchema);
