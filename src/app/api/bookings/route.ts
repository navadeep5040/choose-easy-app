import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Notification from '@/models/Notification';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    let bookings;
    if (userRole === 'admin') {
      // Admin sees all bookings
      bookings = await Booking.find().sort({ createdAt: -1 });
    } else if (userRole === 'mentor') {
      // Mentor sees bookings assigned to them
      bookings = await Booking.find({
        $or: [{ mentorUserId: userId }, { userId: userId }]
      }).sort({ createdAt: -1 });
    } else {
      // Regular user sees only their own bookings
      bookings = await Booking.find({ userId }).sort({ createdAt: -1 });
    }

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in to book a mentor.' }, { status: 401 });
    }

    const { mentorId, mentorName, subject, scheduledDate, timeSlot } = await req.json();

    if (!mentorId || !mentorName || !subject || !scheduledDate || !timeSlot) {
      return NextResponse.json({ error: 'All fields are required: mentorId, mentorName, subject, scheduledDate, timeSlot.' }, { status: 400 });
    }

    await connectToDatabase();

    const userId = (session.user as any).id;

    // Check for conflicting booking (same mentor, same date, same time slot)
    const existingBooking = await Booking.findOne({
      mentorId,
      scheduledDate: new Date(scheduledDate),
      'timeSlot.startTime': timeSlot.startTime,
      'timeSlot.endTime': timeSlot.endTime,
      status: { $in: ['Pending', 'Confirmed'] }
    });

    if (existingBooking) {
      return NextResponse.json({ error: 'This time slot is already booked. Please choose another.' }, { status: 400 });
    }

    // Get mentor's userId for notifications
    const Mentor = (await import('@/models/Mentor')).default;
    const mentor = await Mentor.findById(mentorId);
    const mentorUserId = mentor?.userId || null;

    const userName = (session.user as any).name || (session.user as any).email || 'User';

    const newBooking = new Booking({
      userId,
      mentorId,
      mentorUserId,
      mentorName,
      userName,
      subject,
      scheduledDate: new Date(scheduledDate),
      timeSlot,
      status: 'Pending',
    });

    await newBooking.save();

    // Send notification to mentor (if they have a user account)
    if (mentorUserId) {
      await Notification.create({
        recipientId: mentorUserId,
        senderId: userId,
        type: 'booking_request',
        message: `New booking request from ${userName} for ${subject} on ${new Date(scheduledDate).toLocaleDateString()} (${timeSlot.startTime} - ${timeSlot.endTime})`,
        bookingId: newBooking._id,
        link: '/mentor-dashboard',
      });
    }

    // Send notification to all admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        recipientId: admin._id,
        senderId: userId,
        type: 'booking_request',
        message: `New booking: ${userName} → ${mentorName} for ${subject} on ${new Date(scheduledDate).toLocaleDateString()}`,
        bookingId: newBooking._id,
        link: '/admin',
      });
    }

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
