import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { token, email, password } = await req.json();

    if (!token || !email || !password) {
      return NextResponse.json({ error: 'Token, email, and new password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    await connectToDatabase();

    // Hash the provided token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: new Date() }, // Token must not be expired
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset fields
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    return NextResponse.json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
