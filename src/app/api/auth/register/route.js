import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';

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
    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }
    const hashed = await hashPassword(password);
    const admin = await prisma.admin.create({
      data: { name, email, password: hashed, phone: phone || null, role: 'ADMIN' },
    });
    const token = generateToken({ id: admin.id, email: admin.email });
    const response = NextResponse.json(
      { message: 'Registration successful', admin: { id: admin.id, name: admin.name, email: admin.email } },
      { status: 201 }
    );
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    return response;
  } catch (err) {
    console.error('Register error:', err);
    const isDbConnection = err?.name === 'PrismaClientInitializationError' || err?.message?.includes('DNS resolution');
    const message = isDbConnection
      ? 'Database connection failed. Check your .env DATABASE_URL (use a real MongoDB Atlas URI or mongodb://localhost:27017/ctms).'
      : 'Registration failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
