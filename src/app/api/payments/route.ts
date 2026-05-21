import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Payment from '@/models/Payment';
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

    let payments;
    if (userRole === 'admin') {
      payments = await Payment.find().sort({ createdAt: -1 });
    } else {
      payments = await Payment.find({ userId }).sort({ createdAt: -1 });
    }

    // Calculate revenue stats for admin
    let stats = null;
    if (userRole === 'admin') {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const weeklyPayments = await Payment.find({
        status: 'completed',
        createdAt: { $gte: oneWeekAgo },
      });
      const monthlyPayments = await Payment.find({
        status: 'completed',
        createdAt: { $gte: oneMonthAgo },
      });
      const allCompleted = await Payment.find({ status: 'completed' });

      stats = {
        weeklyRevenue: weeklyPayments.reduce((sum, p) => sum + p.amount, 0),
        weeklyCount: weeklyPayments.length,
        monthlyRevenue: monthlyPayments.reduce((sum, p) => sum + p.amount, 0),
        monthlyCount: monthlyPayments.length,
        totalRevenue: allCompleted.reduce((sum, p) => sum + p.amount, 0),
        totalCount: allCompleted.length,
      };
    }

    return NextResponse.json({ payments, stats });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const { courseId, courseTitle, mentorId, mentorName, amount, paymentMethod, cardLast4 } = await req.json();

    if (!courseId || !courseTitle || !amount || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required payment fields.' }, { status: 400 });
    }

    await connectToDatabase();

    const userId = (session.user as any).id;
    const userName = (session.user as any).name || 'User';
    const userEmail = (session.user as any).email || '';

    // Generate a transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Simulate payment processing (always succeeds in demo)
    const payment = await Payment.create({
      userId,
      userName,
      userEmail,
      courseId,
      courseTitle,
      mentorId: mentorId || null,
      mentorName: mentorName || '',
      amount,
      currency: 'USD',
      paymentMethod,
      cardLast4: cardLast4 || '',
      transactionId,
      status: 'completed',
    });

    // Notify admins
    const Notification = (await import('@/models/Notification')).default;
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        recipientId: admin._id,
        senderId: userId,
        type: 'booking_confirmed',
        message: `Payment received: $${amount} from ${userName} for "${courseTitle}" (${transactionId})`,
        link: '/admin',
      });
    }

    return NextResponse.json({ payment, transactionId }, { status: 201 });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
