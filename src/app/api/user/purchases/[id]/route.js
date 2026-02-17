import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        provider: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    return NextResponse.json(purchase);
  } catch (err) {
    console.error('Purchase GET by ID:', err);
    return NextResponse.json({ error: 'Failed to fetch purchase' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { paidAmount } = body;

    if (paidAmount === undefined) {
      return NextResponse.json({ error: 'paidAmount is required' }, { status: 400 });
    }

    const purchase = await prisma.purchase.findUnique({ where: { id } });
    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    const paid = parseFloat(paidAmount) || 0;
    const dueAmount = purchase.totalAmount - paid;

    const updated = await prisma.purchase.update({
      where: { id },
      data: {
        paidAmount: paid,
        dueAmount,
      },
      include: {
        provider: true,
        items: { include: { product: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('Purchase PUT:', err);
    return NextResponse.json({ error: 'Failed to update purchase' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    // Revert stock changes
    for (const item of purchase.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { currentStock: { decrement: item.quantity } },
      });
    }

    await prisma.purchase.delete({ where: { id } });

    return NextResponse.json({ message: 'Purchase deleted successfully' });
  } catch (err) {
    console.error('Purchase DELETE:', err);
    return NextResponse.json({ error: 'Failed to delete purchase' }, { status: 500 });
  }
}
