import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Mentor from '@/models/Mentor';

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject');

    let query: any = {};
    if (subject && subject !== 'All') {
      query.subjects = { $in: [subject] };
    }

    const mentors = await Mentor.find(query).sort({ createdAt: -1 });
    return NextResponse.json(mentors);
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { name, domain, matchScore, status, bio, subjects, availability, hourlyRate, image } = await req.json();

    if (!name || !domain || !matchScore || !status) {
      return NextResponse.json({ error: 'Name, domain, matchScore and status are required.' }, { status: 400 });
    }

    await connectToDatabase();

    const newMentor = new Mentor({
      name,
      domain,
      matchScore,
      status,
      bio: bio || '',
      subjects: subjects || [domain],
      availability: availability && availability.length > 0 ? availability : [
        { day: 'Monday', startTime: '09:00', endTime: '11:00' },
        { day: 'Wednesday', startTime: '13:00', endTime: '15:00' },
        { day: 'Friday', startTime: '15:00', endTime: '17:00' }
      ],
      hourlyRate: hourlyRate || 0,
      image: image || '',
    });

    await newMentor.save();

    return NextResponse.json(newMentor, { status: 201 });
  } catch (error) {
    console.error('Error creating mentor:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
