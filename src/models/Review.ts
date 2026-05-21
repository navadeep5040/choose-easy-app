import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  mentorId: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  mentorId: { type: Schema.Types.ObjectId, ref: 'Mentor', required: true },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  userName: { type: String, default: 'Anonymous' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

// Each user can only review each booking once
ReviewSchema.index({ userId: 1, bookingId: 1 }, { unique: true });

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
