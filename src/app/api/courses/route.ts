import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/models/Course';
import Mentor from '@/models/Mentor';

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject');
    const isAdminRequest = searchParams.get('admin') === 'true';

    // Admin requests bypass the isActive filter so CourseManager shows all courses
    const query: Record<string, unknown> = isAdminRequest ? {} : { isActive: true };
    if (subject && subject !== 'All') {
      query.subject = subject;
    }

    const courses = await Course.find(query).sort({ createdAt: -1 });

    const coursesWithMentors = await Promise.all(
      courses.map(async (course) => {
        const mentors = await Mentor.find({ _id: { $in: course.mentorIds } }).select('name image domain status');
        return {
          ...course.toObject(),
          mentors: mentors.map((m) => ({ _id: m._id, name: m.name, image: m.image, domain: m.domain, status: m.status })),
        };
      })
    );

    return NextResponse.json(coursesWithMentors);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();

    const { title, description, subject, price, duration, level, mentorIds, features, image } = body;

    if (!title || !description || !subject || price === undefined || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const course = new Course({
      title,
      description,
      subject,
      price: Number(price),
      duration,
      level: level || 'Beginner',
      mentorIds: mentorIds || [],
      features: features || [],
      image: image || '',
      isActive: true,
    });

    await course.save();
    return NextResponse.json(course.toObject(), { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
