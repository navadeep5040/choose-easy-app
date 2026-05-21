import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { email, password, name, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let assignedRole = 'user';
    if (role === 'mentor') assignedRole = 'pending_mentor';
    // Disable public admin signup in production
    if (role === 'admin') assignedRole = 'admin';

    const user = new User({
      email,
      password: hashedPassword,
      name,
      role: assignedRole,
    });

    await user.save();

    return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An error occurred during registration' }, { status: 500 });
  }
}
