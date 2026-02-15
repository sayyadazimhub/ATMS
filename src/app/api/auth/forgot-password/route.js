import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateResetToken } from '@/lib/auth';
import { sendResetEmail } from '@/lib/mail';

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return NextResponse.json({ error: 'No account found with this email' }, { status: 404 });
    }
    const token = generateResetToken();
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.admin.update({
      where: { id: admin.id },
      data: { resetToken: token, resetTokenExp: expires },
    });
    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;
    const resetLink = `${baseUrl}/reset-password?token=${token}`;
    await sendResetEmail(admin.email, resetLink);
    return NextResponse.json({ message: 'Reset instructions sent to your email' }, { status: 200 });
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 });
  }
}
