import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import ChatSession from '@/models/ChatSession';
import Notification from '@/models/Notification';
import Booking from '@/models/Booking';

// GET: Fetch mentor chat messages for a booking
export async function GET(
  req: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await params;
    await connectToDatabase();

    const userId = (session.user as any).id;

    // Find the chat session for this booking
    const chatSession = await ChatSession.findOne({ bookingId, type: 'mentor' });

    if (!chatSession) {
      return NextResponse.json({ error: 'Chat session not found. The booking may not be confirmed yet.' }, { status: 404 });
    }

    // Verify the user is a participant (booking user, mentor, or admin)
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const userRole = (session.user as any).role;
    const isParticipant = booking.userId.toString() === userId ||
      (booking.mentorUserId && booking.mentorUserId.toString() === userId) ||
      userRole === 'admin';

    if (!isParticipant) {
      return NextResponse.json({ error: 'Not authorized to view this chat' }, { status: 403 });
    }

    return NextResponse.json({
      chatSession,
      booking: {
        subject: booking.subject,
        scheduledDate: booking.scheduledDate,
        timeSlot: booking.timeSlot,
        mentorName: booking.mentorName,
        userName: booking.userName,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error('Error fetching chat:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Send a message in the mentor chat
export async function POST(
  req: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await params;
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    await connectToDatabase();

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    const userName = (session.user as any).name || (session.user as any).email;

    const chatSession = await ChatSession.findOne({ bookingId, type: 'mentor' });
    if (!chatSession) {
      return NextResponse.json({ error: 'Chat session not found' }, { status: 404 });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Determine role in this chat context
    const isMentor = booking.mentorUserId && booking.mentorUserId.toString() === userId;
    const isUser = booking.userId.toString() === userId;

    if (!isMentor && !isUser && userRole !== 'admin') {
      return NextResponse.json({ error: 'Not authorized to send messages in this chat' }, { status: 403 });
    }

    const messageRole = isMentor ? 'mentor' : 'user';

    chatSession.messages.push({
      role: messageRole,
      senderId: userId,
      senderName: userName,
      content: message,
      timestamp: new Date(),
    });

    await chatSession.save();

    // Send notification to the other party
    const recipientId = isMentor ? booking.userId : booking.mentorUserId;
    if (recipientId) {
      // Only create notification if the last one was more than 2 min ago (avoid spam)
      const recentNotification = await Notification.findOne({
        recipientId,
        type: 'new_message',
        bookingId: booking._id,
        createdAt: { $gt: new Date(Date.now() - 2 * 60 * 1000) },
      });

      if (!recentNotification) {
        await Notification.create({
          recipientId,
          senderId: userId,
          type: 'new_message',
          message: `New message from ${userName} in your ${booking.subject} session`,
          bookingId: booking._id,
          link: `/dashboard/chat/${booking._id}`,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
