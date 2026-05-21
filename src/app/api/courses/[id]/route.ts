import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/models/Course';
import Mentor from '@/models/Mentor';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const mentors = await Mentor.find({ _id: { $in: course.mentorIds } });

    return NextResponse.json({
      ...course.toObject(),
      mentors,
    });
  } catch (error) {
    console.error('Error fetching course:', error);
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const body = await req.json();
    const { title, description, subject, price, duration, level, mentorIds, features, image, isActive } = body;

    const course = await Course.findByIdAndUpdate(
      id,
      {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(subject !== undefined && { subject }),
        ...(price !== undefined && { price: Number(price) }),
        ...(duration !== undefined && { duration }),
        ...(level !== undefined && { level }),
        ...(mentorIds !== undefined && { mentorIds }),
        ...(features !== undefined && { features }),
        ...(image !== undefined && { image }),
        ...(isActive !== undefined && { isActive }),
      },
      { new: true }
    );

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json(course.toObject());
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const course = await Course.findByIdAndDelete(id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
