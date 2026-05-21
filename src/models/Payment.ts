import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  courseId: mongoose.Types.ObjectId;
  courseTitle: string;
  mentorId?: mongoose.Types.ObjectId;
  mentorName?: string;
  amount: number;
  currency: string;
  paymentMethod: 'card' | 'upi' | 'netbanking';
  cardLast4?: string;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: Date;
}

const PaymentSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  courseTitle: { type: String, required: true },
  mentorId: { type: Schema.Types.ObjectId, ref: 'Mentor', required: false },
  mentorName: { type: String, default: '' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  paymentMethod: { type: String, enum: ['card', 'upi', 'netbanking'], default: 'card' },
  cardLast4: { type: String, default: '' },
  transactionId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
