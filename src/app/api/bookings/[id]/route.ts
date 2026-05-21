import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Notification from '@/models/Notification';
import ChatSession from '@/models/ChatSession';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await req.json();

    if (!['Confirmed', 'Cancelled', 'Completed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await connectToDatabase();

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    // Only mentor (of this booking), admin, or the booking user can update
    const isAdmin = userRole === 'admin';
    const isMentor = booking.mentorUserId && booking.mentorUserId.toString() === userId;
    const isBookingUser = booking.userId.toString() === userId;

    if (!isAdmin && !isMentor && !isBookingUser) {
      return NextResponse.json({ error: 'Not authorized to update this booking' }, { status: 403 });
    }

    // Users can only cancel their own bookings
    if (isBookingUser && !isAdmin && !isMentor && status !== 'Cancelled') {
      return NextResponse.json({ error: 'You can only cancel your own bookings' }, { status: 403 });
    }

    booking.status = status;
    await booking.save();

    const userName = (session.user as any).name || (session.user as any).email;

    // Create notifications based on status change
    if (status === 'Confirmed') {
      // Notify the user
      await Notification.create({
        recipientId: booking.userId,
        senderId: userId,
        type: 'booking_confirmed',
        message: `Your booking with ${booking.mentorName} for ${booking.subject} on ${new Date(booking.scheduledDate).toLocaleDateString()} has been confirmed! You can now start chatting.`,
        bookingId: booking._id,
        link: `/dashboard/chat/${booking._id}`,
      });

      // Auto-create a chat session for the user and mentor
      const existingChat = await ChatSession.findOne({ bookingId: booking._id, type: 'mentor' });
      if (!existingChat && booking.mentorUserId) {
        await ChatSession.create({
          userId: booking.userId,
          type: 'mentor',
          mentorId: booking.mentorId,
          mentorUserId: booking.mentorUserId,
          bookingId: booking._id,
          title: `Chat: ${booking.subject} with ${booking.mentorName}`,
          messages: [{
            role: 'assistant',
            content: `Welcome! This chat session has been opened for your ${booking.subject} guidance session with ${booking.mentorName} on ${new Date(booking.scheduledDate).toLocaleDateString()} (${booking.timeSlot.startTime} - ${booking.timeSlot.endTime}). Feel free to introduce yourself and discuss your goals!`,
            timestamp: new Date(),
          }],
        });
      }
    } else if (status === 'Cancelled') {
      // Notify the other party
      const recipientId = isMentor || isAdmin ? booking.userId : booking.mentorUserId;
      if (recipientId) {
        await Notification.create({
          recipientId,
          senderId: userId,
          type: 'booking_cancelled',
          message: `Booking for ${booking.subject} on ${new Date(booking.scheduledDate).toLocaleDateString()} has been cancelled by ${userName}.`,
          bookingId: booking._id,
          link: '/dashboard',
        });
      }
    } else if (status === 'Completed') {
      await Notification.create({
        recipientId: booking.userId,
        senderId: userId,
        type: 'booking_completed',
        message: `Your session with ${booking.mentorName} for ${booking.subject} is complete. Leave a review on your dashboard.`,
        bookingId: booking._id,
        link: '/dashboard',
      });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
