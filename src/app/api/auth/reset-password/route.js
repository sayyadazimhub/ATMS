import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }
    const admin = await prisma.admin.findFirst({
      where: { resetToken: token, resetTokenExp: { gte: new Date() } },
    });
    if (!admin) {
      return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 });
    }
    const hashed = await hashPassword(password);
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashed, resetToken: null, resetTokenExp: null },
    });
    return NextResponse.json({ message: 'Password reset successful' }, { status: 200 });
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 });
  }
}
