import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = 20;
    const skip = (page - 1) * limit;
    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        include: { customer: true, items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.sale.count(),
    ]);
    return NextResponse.json({
      sales,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Sales GET:', err);
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerId, items } = body;
    if (!customerId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Customer and at least one item are required' },
        { status: 400 }
      );
    }
    let totalAmount = 0;
    let totalProfit = 0;
    const lineItems = [];
    for (const it of items) {
      const product = await prisma.product.findUnique({ where: { id: it.productId } });
      if (!product) {
        return NextResponse.json({ error: `Product ${it.productId} not found` }, { status: 400 });
      }
      const qty = parseFloat(it.quantity) || 0;
      if (product.currentStock < qty) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Available: ${product.currentStock}` },
          { status: 400 }
        );
      }
      const costPrice = parseFloat(it.costPrice) || 0;
      const salePrice = parseFloat(it.salePrice) || 0;
      const profit = (salePrice - costPrice) * qty;
      totalAmount += salePrice * qty;
      totalProfit += profit;
      lineItems.push({
        productId: it.productId,
        quantity: qty,
        costPrice,
        salePrice,
        profit,
      });
    }
    const paidAmount = parseFloat(body.paidAmount) || 0;
    const dueAmount = totalAmount - paidAmount;

    const sale = await prisma.sale.create({
      data: {
        customerId,
        totalAmount,
        paidAmount,
        dueAmount,
        totalProfit,
        items: {
          create: lineItems.map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
            costPrice: it.costPrice,
            salePrice: it.salePrice,
            profit: it.profit,
          })),
        },
      },
      include: { customer: true, items: { include: { product: true } } },
    });
    for (const it of lineItems) {
      await prisma.product.update({
        where: { id: it.productId },
        data: { currentStock: { decrement: it.quantity } },
      });
    }
    return NextResponse.json(sale, { status: 201 });
  } catch (err) {
    console.error('Sales POST:', err);
    return NextResponse.json({ error: 'Failed to create sale' }, { status: 500 });
  }
}
