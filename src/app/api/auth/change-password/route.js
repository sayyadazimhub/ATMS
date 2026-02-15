import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken, hashPassword, comparePassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const token = (await cookies()).get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current and new password are required' },
        { status: 400 }
      );
    }
    const admin = await prisma.admin.findUnique({ where: { id: decoded.id } });
    if (!admin) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const valid = await comparePassword(currentPassword, admin.password);
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }
    const hashed = await hashPassword(newPassword);
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashed },
    });
    return NextResponse.json({ message: 'Password updated' }, { status: 200 });
  } catch (err) {
    console.error('Change password error:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
