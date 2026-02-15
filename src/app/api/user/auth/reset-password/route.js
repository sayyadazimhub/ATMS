import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, otp, newPassword } = await request.json();
    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Email, OTP and new password are required' },
        { status: 400 }
      );
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    if (user.otp !== otp || !user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }
    const hashed = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, otp: null, otpExpiresAt: null },
    });
    return NextResponse.json({ message: 'Password reset successful' }, { status: 200 });
  } catch (err) {
    console.error('User reset password error:', err);
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 });
  }
}
