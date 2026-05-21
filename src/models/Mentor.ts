import mongoose, { Schema, Document } from 'mongoose';

export interface IAvailabilitySlot {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // e.g. "10:00"
  endTime: string;   // e.g. "12:00"
}

export interface IMentor extends Document {
  userId?: mongoose.Types.ObjectId;
  name: string;
  bio: string;
  subjects: string[];
  domain: string;
  matchScore: string;
  status: 'Available' | 'Busy' | 'Offline';
  availability: IAvailabilitySlot[];
  hourlyRate: number;
  image?: string;
  createdAt: Date;
  // Extended profile fields
  headline?: string;
  teachingDescription?: string;
  expertiseAreas?: string[];
  learningOutcomes?: string[];
  sessionExpectations?: string;
  yearsOfExperience?: number;
  teachingCategories?: string[];
  linkedIn?: string;
  github?: string;
  portfolio?: string;
}

const AvailabilitySlotSchema = new Schema<IAvailabilitySlot>({
  day: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
}, { _id: false });

const MentorSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  name: { type: String, required: true },
  bio: { type: String, default: '' },
  subjects: [{ type: String }],
  domain: { type: String, required: true },
  matchScore: { type: String, required: true },
  status: { type: String, required: true, enum: ['Available', 'Busy', 'Offline'], default: 'Available' },
  availability: [AvailabilitySlotSchema],
  hourlyRate: { type: Number, default: 0 },
  image: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  // Extended profile fields
  headline: { type: String, default: '' },
  teachingDescription: { type: String, default: '' },
  expertiseAreas: [{ type: String }],
  learningOutcomes: [{ type: String }],
  sessionExpectations: { type: String, default: '' },
  yearsOfExperience: { type: Number, default: 0 },
  teachingCategories: [{ type: String }],
  linkedIn: { type: String, default: '' },
  github: { type: String, default: '' },
  portfolio: { type: String, default: '' },
});

export default mongoose.models.Mentor || mongoose.model<IMentor>('Mentor', MentorSchema);
