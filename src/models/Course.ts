import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  subject: string;
  price: number;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  mentorIds: mongoose.Types.ObjectId[];
  features: string[];
  image: string;
  isActive: boolean;
  createdAt: Date;
}

const CourseSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  subject: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  mentorIds: [{ type: Schema.Types.ObjectId, ref: 'Mentor' }],
  features: [{ type: String }],
  image: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
