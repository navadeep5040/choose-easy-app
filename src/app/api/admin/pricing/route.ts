import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import PricingPlan from '@/models/PricingPlan';
import { MARKETING_PLANS } from '@/data/marketing';

/**
 * GET /api/admin/pricing
 * Returns all pricing plans from MongoDB.
 * Falls back to static MARKETING_PLANS if no DB plans exist yet.
 * Public endpoint — pricing page fetches from here.
 */
export async function GET() {
  try {
    await connectToDatabase();
    const plans = await PricingPlan.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 });

    if (plans.length === 0) {
      // Return static fallback data formatted the same way
      return NextResponse.json(MARKETING_PLANS.map((p, i) => ({
        ...p,
        _id: `static-${p.id}`,
        planId: p.id,
        isActive: true,
        sortOrder: i,
        badge: '',
      })));
    }

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * GET /api/admin/pricing?all=true  (admin only — includes inactive plans)
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    await connectToDatabase();

    const body = await req.json();
    const {
      planId, name, tagline, monthlyPrice, annualPrice,
      recommended, cta, href, features, audience, isActive, badge, sortOrder,
    } = body;

    if (!planId || !name || monthlyPrice === undefined || annualPrice === undefined) {
      return NextResponse.json({ error: 'planId, name, monthlyPrice, and annualPrice are required.' }, { status: 400 });
    }

    const plan = new PricingPlan({
      planId,
      name,
      tagline: tagline || '',
      monthlyPrice: Number(monthlyPrice),
      annualPrice: Number(annualPrice),
      recommended: Boolean(recommended),
      cta: cta || 'Get Started',
      href: href || '/login?mode=register',
      features: features || [],
      audience: audience || '',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      badge: badge || '',
      sortOrder: Number(sortOrder) || 0,
    });

    await plan.save();
    return NextResponse.json(plan, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && String((error as Record<string, unknown>)['code']) === '11000') {
      return NextResponse.json({ error: 'A plan with this planId already exists.' }, { status: 409 });
    }
    console.error('Error creating pricing plan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
