import mongoose, { Schema, Document } from 'mongoose';

export interface ICareer extends Document {
  name: string;
  domain: string;
  demand: string;
  description: string;
}

const CareerSchema: Schema = new Schema({
  name: { type: String, required: true },
  domain: { type: String, required: true },
  demand: { type: String, required: true }, // e.g. High, Medium, Low
  description: { type: String, required: true },
});

export default mongoose.models.Career || mongoose.model<ICareer>('Career', CareerSchema);
