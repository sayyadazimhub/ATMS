import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { sendOtpEmail } from '@/lib/mail';
import crypto from 'crypto';

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, phone } = body;
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      );
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }
    const hashed = await hashPassword(password);
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        phone: phone || null,
        otp,
        otpExpiresAt,
        role: 'USER',
      },
    });
    await sendOtpEmail(email, otp, 'verification');
    return NextResponse.json(
      { message: 'Registration successful. Check your email for the OTP to verify your account.', email },
      { status: 201 }
    );
  } catch (err) {
    console.error('User register error:', err);
    const isDbConnection =
      err?.name === 'PrismaClientInitializationError' ||
      err?.message?.includes('DNS resolution');
    const message = isDbConnection
      ? 'Database connection failed. Set DATABASE_URL in .env to a real MongoDB URI (see .env.example).'
      : 'Registration failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
