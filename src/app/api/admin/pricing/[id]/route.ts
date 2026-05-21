import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import PricingPlan from '@/models/PricingPlan';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const plan = await PricingPlan.findById(id);
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }
    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error fetching pricing plan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const body = await req.json();
    const {
      name, tagline, monthlyPrice, annualPrice,
      recommended, cta, href, features, audience, isActive, badge, sortOrder,
    } = body;

    const updated = await PricingPlan.findByIdAndUpdate(
      id,
      {
        name,
        tagline,
        monthlyPrice: Number(monthlyPrice),
        annualPrice: Number(annualPrice),
        recommended: Boolean(recommended),
        cta,
        href,
        features,
        audience,
        isActive: Boolean(isActive),
        badge,
        sortOrder: Number(sortOrder) || 0,
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating pricing plan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const deleted = await PricingPlan.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting pricing plan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
