import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendOtpEmail } from '@/lib/mail';
import crypto from 'crypto';

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'No account found with this email' }, { status: 404 });
    }
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await prisma.user.update({
      where: { id: user.id },
      data: { otp, otpExpiresAt, resetToken: null, resetTokenExp: null },
    });
    await sendOtpEmail(email, otp, 'reset');
    return NextResponse.json(
      { message: 'OTP sent to your email. It expires in 10 minutes.' },
      { status: 200 }
    );
  } catch (err) {
    console.error('User forgot password error:', err);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
