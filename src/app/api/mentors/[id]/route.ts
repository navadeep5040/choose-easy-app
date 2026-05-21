import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Mentor from '@/models/Mentor';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const mentor = await Mentor.findById(id);
    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }
    return NextResponse.json(mentor);
  } catch (error) {
    console.error('Error fetching mentor:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Mentor ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const deletedMentor = await Mentor.findByIdAndDelete(id);

    if (!deletedMentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Mentor deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting mentor:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Mentor ID is required' }, { status: 400 });
    }

    const { name, domain, matchScore, status, bio, subjects, availability, hourlyRate, image } = await req.json();

    await connectToDatabase();

    const updatedMentor = await Mentor.findByIdAndUpdate(
      id,
      { name, domain, matchScore, status, bio, subjects, availability, hourlyRate, image },
      { new: true }
    );

    if (!updatedMentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    return NextResponse.json(updatedMentor, { status: 200 });
  } catch (error) {
    console.error('Error updating mentor:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
