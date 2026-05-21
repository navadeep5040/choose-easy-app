import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  senderId?: mongoose.Types.ObjectId;
  type: 'booking_request' | 'booking_confirmed' | 'booking_cancelled' | 'mentor_approved' | 'new_message';
  message: string;
  bookingId?: mongoose.Types.ObjectId;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  type: {
    type: String,
    required: true,
    enum: ['booking_request', 'booking_confirmed', 'booking_cancelled', 'mentor_approved', 'new_message'],
  },
  message: { type: String, required: true },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: false },
  link: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
