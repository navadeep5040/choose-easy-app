import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Mentor from '@/models/Mentor';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const mentor = await Mentor.findById(id);
    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }
    return NextResponse.json(mentor.availability || []);
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { availability } = await req.json();

    await connectToDatabase();

    // Only the mentor themselves or an admin can update availability
    const mentor = await Mentor.findById(id);
    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    if (userRole !== 'admin' && (!mentor.userId || mentor.userId.toString() !== userId)) {
      return NextResponse.json({ error: 'You can only update your own availability' }, { status: 403 });
    }

    mentor.availability = availability;
    await mentor.save();

    return NextResponse.json({ message: 'Availability updated', availability: mentor.availability });
  } catch (error) {
    console.error('Error updating availability:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
