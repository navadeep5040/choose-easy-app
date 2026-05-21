import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Mentor from '@/models/Mentor';

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
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'pending_mentor') {
      return NextResponse.json({ error: 'User is not a pending mentor' }, { status: 400 });
    }

    // Change role to mentor
    user.role = 'mentor';
    await user.save();

    // Create a corresponding Mentor profile with default availability slots
    const newMentor = new Mentor({
      userId: user._id,
      name: user.name || user.email.split('@')[0],
      domain: 'Technology',
      subjects: ['Technology'],
      matchScore: 'TBD',
      status: 'Available',
      availability: [
        { day: 'Monday', startTime: '09:00', endTime: '11:00' },
        { day: 'Wednesday', startTime: '13:00', endTime: '15:00' },
        { day: 'Friday', startTime: '15:00', endTime: '17:00' }
      ]
    });

    await newMentor.save();

    return NextResponse.json({ message: 'Mentor approved and profile created' }, { status: 200 });
  } catch (error) {
    console.error('Error approving mentor:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
