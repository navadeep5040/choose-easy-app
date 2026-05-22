import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectToDatabase from './mongodb';
import User from '../models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'name@domain.com' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        await connectToDatabase();

        const user = await User.findOne({ email: credentials.email });

        if (!user || !user.password) {
          throw new Error('No user found with this email');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        return token;
      }

      // Refresh role from DB so mentor approval is reflected without re-login.
      // If user no longer exists (e.g. after DB reset), invalidate the token
      // so NextAuth treats the session as expired and forces re-login.
      if (token?.id) {
        try {
          await connectToDatabase();
          const dbUser = await User.findById(token.id).select('role').lean();
          if (dbUser) {
            token.role = (dbUser as any).role;
          } else {
            // User was deleted — mark token as invalid so NextAuth forces re-login
            console.warn(`[Auth] JWT token references deleted user ${token.id} — invalidating session`);
            token.id = undefined;
            token.role = undefined;
            token.sub = undefined;
          }
        } catch (error) {
          console.error('JWT role refresh failed:', error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as string | undefined;
        session.user.id = token.id as string | undefined;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
