import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword } from '@/lib/auth';
import { signUserToken } from '@/lib/jwt-user';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email first. Check your inbox for the OTP.' },
        { status: 401 }
      );
    }
    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const token = await signUserToken({ id: user.id, email: user.email, role: 'user' });
    const response = NextResponse.json(
      { message: 'Login successful', user: { id: user.id, name: user.name, email: user.email } },
      { status: 200 }
    );
    response.cookies.set('user-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    return response;
  } catch (err) {
    console.error('User login error:', err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
