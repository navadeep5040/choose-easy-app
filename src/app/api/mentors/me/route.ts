import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Mentor from '@/models/Mentor';

/**
 * GET /api/mentors/me
 * Returns the mentor profile linked to the currently logged-in user.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }

    await connectToDatabase();

    const mentor = await Mentor.findOne({ userId });
    if (!mentor) {
      return NextResponse.json({ error: 'Mentor profile not found for this account' }, { status: 404 });
    }

    return NextResponse.json(mentor);
  } catch (error) {
    console.error('Error fetching mentor profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT /api/mentors/me
 * Allows a logged-in mentor to update their own profile fields.
 * Only updates safe profile fields — availability and admin-only fields
 * (matchScore, status, hourlyRate) remain editable here too for convenience.
 */
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== 'mentor') {
      return NextResponse.json({ error: 'Forbidden: mentor role required' }, { status: 403 });
    }

    await connectToDatabase();

    const mentor = await Mentor.findOne({ userId });
    if (!mentor) {
      return NextResponse.json({ error: 'Mentor profile not found for this account' }, { status: 404 });
    }

    const body = await req.json();

    // Whitelist of fields a mentor can self-edit
    const allowedFields = [
      'bio',
      'headline',
      'teachingDescription',
      'expertiseAreas',
      'learningOutcomes',
      'sessionExpectations',
      'yearsOfExperience',
      'teachingCategories',
      'linkedIn',
      'github',
      'portfolio',
      'image',
      'subjects',
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    const updated = await Mentor.findByIdAndUpdate(mentor._id, updates, { returnDocument: 'after' });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating mentor profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
