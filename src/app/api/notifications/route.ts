import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Notification from '@/models/Notification';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const userId = (session.user as any).id;
    const notifications = await Notification.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ recipientId: userId, isRead: false });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationIds, markAllRead } = await req.json();

    await connectToDatabase();

    const userId = (session.user as any).id;

    if (markAllRead) {
      await Notification.updateMany(
        { recipientId: userId, isRead: false },
        { isRead: true }
      );
    } else if (notificationIds && notificationIds.length > 0) {
      await Notification.updateMany(
        { _id: { $in: notificationIds }, recipientId: userId },
        { isRead: true }
      );
    }

    return NextResponse.json({ message: 'Notifications updated' });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
