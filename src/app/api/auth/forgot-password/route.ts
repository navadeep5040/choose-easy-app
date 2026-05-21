import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      // Don't reveal whether the email exists — security best practice
      return NextResponse.json({
        message: 'If an account with that email exists, a reset link has been generated.',
        // In production, send email. For demo, we return the token.
      });
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save hashed token + 1-hour expiry to user
    user.resetToken = hashedToken;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // In production: send email with link containing resetToken
    // For demo mode: return the raw token so you can test
    const resetUrl = `/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    return NextResponse.json({
      message: 'If an account with that email exists, a reset link has been generated.',
      // Demo-only fields — remove in production
      demoResetUrl: resetUrl,
      demoToken: resetToken,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
