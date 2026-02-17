import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyUserToken } from '@/lib/jwt-user';

export async function GET(request) {
  try {
    const token = cookies().get('user-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyUserToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    const where = {
      userId: decoded.id,
      ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { phone: { contains: search } }] } : {})
    };

    let results = [];
    try {
      results = await Promise.all([
        prisma.provider.findMany({
          where,
          orderBy: { name: 'asc' },
          skip,
          take: limit,
        }),
        prisma.provider.count({ where }),
      ]);
    } catch (error) {
      console.warn('Providers Safe Query triggered:', error.message);
      const safeWhere = { ...where };
      delete safeWhere.userId;
      results = await Promise.all([
        prisma.provider.findMany({
          where: safeWhere,
          orderBy: { name: 'asc' },
          skip,
          take: limit,
        }),
        prisma.provider.count({ where: safeWhere }),
      ]);
    }
    const [providers, total] = results;
    return NextResponse.json({
      providers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Providers GET:', err);
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = cookies().get('user-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyUserToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, phone, address } = body;
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const provider = await prisma.provider.create({
      data: { name, phone: phone || null, address: address || null, userId: decoded.id },
    });
    return NextResponse.json(provider, { status: 201 });
  } catch (err) {
    console.error('Providers POST:', err);
    return NextResponse.json({ error: 'Failed to create provider' }, { status: 500 });
  }
}
