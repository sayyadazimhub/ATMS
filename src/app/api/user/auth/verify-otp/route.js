import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signUserToken } from '@/lib/jwt-user';

export async function POST(request) {
  try {
    const { email, otp } = await request.json();
    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or OTP' }, { status: 400 });
    }
    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email already verified. You can log in.' }, { status: 400 });
    }
    if (user.otp !== otp || !user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, otp: null, otpExpiresAt: null },
    });
    const token = await signUserToken({ id: user.id, email: user.email, role: 'user' });
    const response = NextResponse.json(
      { message: 'Email verified', user: { id: user.id, name: user.name, email: user.email } },
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
    console.error('Verify OTP error:', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
