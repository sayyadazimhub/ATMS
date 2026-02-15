import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;
    const where = search
      ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { phone: { contains: search } }] }
      : {};
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ]);
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
    const body = await request.json();
    const { name, phone, address } = body;
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const customer = await prisma.customer.create({
      data: { name, phone: phone || null, address: address || null },
    });
    return NextResponse.json(customer, { status: 201 });
  } catch (err) {
    console.error('Customers POST:', err);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
