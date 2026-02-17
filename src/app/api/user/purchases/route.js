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
    const limit = 20;
    const skip = (page - 1) * limit;

    let results = [];
    try {
      results = await Promise.all([
        prisma.purchase.findMany({
          where: { userId: decoded.id },
          include: { provider: true, items: { include: { product: true } } },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.purchase.count({ where: { userId: decoded.id } }),
      ]);
    } catch (error) {
      console.warn('Purchases Safe Query triggered:', error.message);
      results = await Promise.all([
        prisma.purchase.findMany({
          include: { provider: true, items: { include: { product: true } } },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.purchase.count(),
      ]);
    }
    const [purchases, total] = results;
    return NextResponse.json({
      purchases,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Purchases GET:', err);
    return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = cookies().get('user-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyUserToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { providerId, items, paidAmount = 0 } = body;
    if (!providerId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Provider and at least one item are required' },
        { status: 400 }
      );
    }
    let totalAmount = 0;
    const lineItems = items.map((it) => {
      const qty = parseFloat(it.quantity) || 0;
      const price = parseFloat(it.unitPrice) || 0;
      const total = qty * price;
      totalAmount += total;
      return {
        productId: it.productId,
        quantity: qty,
        unitPrice: price,
        totalPrice: total,
        userId: decoded.id, // Add userId to purchase item
      };
    });
    const paid = parseFloat(paidAmount) || 0;
    const dueAmount = totalAmount - paid;
    const purchase = await prisma.purchase.create({
      data: {
        providerId,
        userId: decoded.id,
        totalAmount,
        paidAmount: paid,
        dueAmount,
        items: { create: lineItems },
      },
      include: { provider: true, items: { include: { product: true } } },
    });
    for (const it of lineItems) {
      await prisma.product.update({
        where: { id: it.productId, userId: decoded.id },
        data: { currentStock: { increment: it.quantity } },
      });
    }
    return NextResponse.json(purchase, { status: 201 });
  } catch (err) {
    console.error('Purchases POST:', err);
    return NextResponse.json({ error: 'Failed to create purchase' }, { status: 500 });
  }
}
