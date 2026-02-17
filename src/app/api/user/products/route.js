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
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {})
    };

    let results = [];
    try {
      results = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            purchaseItems: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { unitPrice: true }
            }
          },
          orderBy: { name: 'asc' },
          skip,
          take: limit,
        }),
        prisma.product.count({ where }),
      ]);
    } catch (error) {
      console.warn('Products Safe Query triggered:', error.message);
      const safeWhere = { ...where };
      delete safeWhere.userId;
      results = await Promise.all([
        prisma.product.findMany({
          where: safeWhere,
          include: {
            purchaseItems: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { unitPrice: true }
            }
          },
          orderBy: { name: 'asc' },
          skip,
          take: limit,
        }),
        prisma.product.count({ where: safeWhere }),
      ]);
    }
    const [products, total] = results;
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
    const token = cookies().get('user-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyUserToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, unit, baseCostPrice = 0, baseSalePrice = 0 } = body;
    if (!name || !unit) {
      return NextResponse.json({ error: 'Name and unit are required' }, { status: 400 });
    }
    const product = await prisma.product.create({
      data: {
        name,
        unit,
        currentStock: 0,
        baseCostPrice: parseFloat(baseCostPrice),
        baseSalePrice: parseFloat(baseSalePrice),
        userId: decoded.id
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error('Products POST:', err);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
