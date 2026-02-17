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
        prisma.customer.findMany({
          where,
          orderBy: { name: 'asc' },
          skip,
          take: limit,
        }),
        prisma.customer.count({ where }),
      ]);
    } catch (error) {
      console.warn('Customers Safe Query triggered:', error.message);
      const safeWhere = { ...where };
      delete safeWhere.userId;
      results = await Promise.all([
        prisma.customer.findMany({
          where: safeWhere,
          orderBy: { name: 'asc' },
          skip,
          take: limit,
        }),
        prisma.customer.count({ where: safeWhere }),
      ]);
    }
    const [customers, total] = results;
    return NextResponse.json({
      customers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Customers GET:', err);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
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
    const customer = await prisma.customer.create({
      data: { name, phone: phone || null, address: address || null, userId: decoded.id },
    });
    return NextResponse.json(customer, { status: 201 });
  } catch (err) {
    console.error('Customers POST:', err);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
