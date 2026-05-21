import mongoose, { Schema, Document } from 'mongoose';

export interface IPricingPlan extends Document {
  planId: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  recommended: boolean;
  cta: string;
  href: string;
  features: string[];
  audience: string;
  isActive: boolean;
  badge?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const PricingPlanSchema: Schema = new Schema(
  {
    planId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    tagline: { type: String, default: '' },
    monthlyPrice: { type: Number, required: true, min: 0 },
    annualPrice: { type: Number, required: true, min: 0 },
    recommended: { type: Boolean, default: false },
    cta: { type: String, default: 'Get Started' },
    href: { type: String, default: '/login?mode=register' },
    features: [{ type: String }],
    audience: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    badge: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.PricingPlan ||
  mongoose.model<IPricingPlan>('PricingPlan', PricingPlanSchema);
