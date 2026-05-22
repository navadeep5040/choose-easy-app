import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase, { isMockDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Booking from '@/models/Booking';
import Payment from '@/models/Payment';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const userId = (session.user as any).id;
    let user = await User.findById(userId).select('-password -resetToken -resetTokenExpiry');

    if (!user) {
      if (isMockDatabase()) {
        user = await User.create({
          _id: userId,
          email: session.user.email,
          name: session.user.name || 'Test User',
          role: (session.user as any).role || 'user',
          createdAt: new Date(),
        });
      } else {
        // User ID in session no longer exists in DB (stale session after DB reset).
        // Return 401 with a SESSION_INVALID code so the client can force sign-out.
        return NextResponse.json({ error: 'User not found', code: 'SESSION_INVALID' }, { status: 401 });
      }
    }

    // Fetch stats based on role
    let totalBookings = 0;
    let completedSessions = 0;
    let confirmedSessions = 0;
    let totalPayments = 0;
    let totalSpent = 0;

    if (user.role === 'mentor') {
      totalBookings = await Booking.countDocuments({ mentorUserId: userId });
      completedSessions = await Booking.countDocuments({ mentorUserId: userId, status: 'Completed' });
      confirmedSessions = await Booking.countDocuments({ mentorUserId: userId, status: 'Confirmed' });
      
      const Mentor = (await import('@/models/Mentor')).default;
      let mentorDoc = await Mentor.findOne({ userId });
      if (!mentorDoc && isMockDatabase()) {
        mentorDoc = await Mentor.create({
          userId,
          name: user.name || 'Test Mentor',
          domain: 'Technology',
          subjects: ['Technology'],
          status: 'Available',
          availability: [
            { day: 'Monday', startTime: '09:00', endTime: '11:00' },
            { day: 'Wednesday', startTime: '13:00', endTime: '15:00' },
            { day: 'Friday', startTime: '15:00', endTime: '17:00' }
          ]
        });
      }
      if (mentorDoc) {
        totalPayments = await Payment.countDocuments({ mentorId: mentorDoc._id, status: 'completed' });
        totalSpent = (await Payment.find({ mentorId: mentorDoc._id, status: 'completed' }))
          .reduce((sum, p) => sum + p.amount, 0);
      }
    } else {
      totalBookings = await Booking.countDocuments({ userId });
      completedSessions = await Booking.countDocuments({ userId, status: 'Completed' });
      confirmedSessions = await Booking.countDocuments({ userId, status: 'Confirmed' });
      totalPayments = await Payment.countDocuments({ userId, status: 'completed' });
      totalSpent = (await Payment.find({ userId, status: 'completed' }))
        .reduce((sum, p) => sum + p.amount, 0);
    }

    return NextResponse.json({
      user: {
        _id: user._id,
        name: user.name || '',
        email: user.email,
        bio: user.bio || '',
        avatar: user.avatar || '',
        role: user.role,
        createdAt: user.createdAt,
      },
      stats: {
        totalBookings,
        completedSessions,
        confirmedSessions,
        totalPayments,
        totalSpent,
      },
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, bio, avatar } = await req.json();

    await connectToDatabase();

    const userId = (session.user as any).id;
    const updateFields: any = {};
    if (name !== undefined) updateFields.name = name;
    if (bio !== undefined) updateFields.bio = bio;
    if (avatar !== undefined) updateFields.avatar = avatar;

    const user = await User.findByIdAndUpdate(userId, updateFields, { new: true })
      .select('-password -resetToken -resetTokenExpiry');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Sync with Mentor profile if the user is a mentor
    if (user.role === 'mentor') {
      const Mentor = (await import('@/models/Mentor')).default;
      const mentorUpdate: any = {};
      if (name !== undefined) mentorUpdate.name = name;
      if (bio !== undefined) mentorUpdate.bio = bio;
      if (avatar !== undefined) mentorUpdate.image = avatar;
      
      await Mentor.findOneAndUpdate({ userId }, mentorUpdate);
    }

    return NextResponse.json({
      user: {
        _id: user._id,
        name: user.name || '',
        email: user.email,
        bio: user.bio || '',
        avatar: user.avatar || '',
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
