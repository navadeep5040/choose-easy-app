import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  mentorId: mongoose.Types.ObjectId;
  mentorUserId?: mongoose.Types.ObjectId;
  mentorName: string;
  userName: string;
  subject: string;
  scheduledDate: Date;
  timeSlot: {
    startTime: string;
    endTime: string;
  };
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: Date;
}

const BookingSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  mentorId: { type: Schema.Types.ObjectId, ref: 'Mentor', required: true },
  mentorUserId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  mentorName: { type: String, required: true },
  userName: { type: String, default: 'User' },
  subject: { type: String, required: true },
  scheduledDate: { type: Date, required: true },
  timeSlot: {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
