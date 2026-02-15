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
      ? { name: { contains: search, mode: 'insensitive' } }
      : {};
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);
    return NextResponse.json({
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Products GET:', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, unit } = body;
    if (!name || !unit) {
      return NextResponse.json({ error: 'Name and unit are required' }, { status: 400 });
    }
    const product = await prisma.product.create({
      data: { name, unit, currentStock: 0 },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error('Products POST:', err);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
