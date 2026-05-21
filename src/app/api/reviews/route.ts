import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Review from '@/models/Review';
import Booking from '@/models/Booking';

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const mentorId = searchParams.get('mentorId');
    const mine = searchParams.get('mine');

    if (mine === 'true') {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const userId = (session.user as { id?: string }).id;
      const reviews = await Review.find({ userId }).select('bookingId').lean();

      return NextResponse.json({
        bookingIds: reviews.map((r) => r.bookingId.toString()),
      });
    }

    if (!mentorId) {
      return NextResponse.json({ error: 'mentorId is required' }, { status: 400 });
    }

    const reviews = await Review.find({ mentorId })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({
      reviews,
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error('Reviews GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, rating, comment } = await req.json();

    if (!bookingId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Valid bookingId and rating (1-5) are required' }, { status: 400 });
    }

    await connectToDatabase();

    const userId = (session.user as any).id;

    // Verify the booking belongs to this user and is completed
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.userId.toString() !== userId) {
      return NextResponse.json({ error: 'You can only review your own bookings' }, { status: 403 });
    }

    if (booking.status !== 'Completed') {
      return NextResponse.json({ error: 'You can only review completed sessions' }, { status: 400 });
    }

    // Check for existing review
    const existingReview = await Review.findOne({ userId, bookingId });
    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this session' }, { status: 400 });
    }

    const review = await Review.create({
      userId,
      mentorId: booking.mentorId,
      bookingId,
      userName: session.user.name || session.user.email || 'Anonymous',
      rating,
      comment: comment || '',
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Reviews POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
