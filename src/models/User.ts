import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  name?: string;
  bio?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'mentor' | 'pending_mentor';
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Optional for OAuth
  name: { type: String, required: false },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin', 'mentor', 'pending_mentor'], default: 'user' },
  resetToken: { type: String, default: null },
  resetTokenExpiry: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

