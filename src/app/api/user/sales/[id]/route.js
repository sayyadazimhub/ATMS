import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
    try {
        const { id } = params;

        const sale = await prisma.sale.findUnique({
            where: { id },
            include: {
                customer: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!sale) {
            return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
        }

        return NextResponse.json(sale);
    } catch (err) {
        console.error('Sale GET by ID:', err);
        return NextResponse.json({ error: 'Failed to fetch sale' }, { status: 500 });
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

        const sale = await prisma.sale.findUnique({ where: { id } });
        if (!sale) {
            return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
        }

        const paid = parseFloat(paidAmount) || 0;
        const dueAmount = sale.totalAmount - paid;

        const updated = await prisma.sale.update({
            where: { id },
            data: {
                paidAmount: paid,
                dueAmount,
            },
            include: {
                customer: true,
                items: { include: { product: true } },
            },
        });

        return NextResponse.json(updated);
    } catch (err) {
        console.error('Sale PUT:', err);
        return NextResponse.json({ error: 'Failed to update sale' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = params;

        const sale = await prisma.sale.findUnique({
            where: { id },
            include: { items: true },
        });

        if (!sale) {
            return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
        }

        // Revert stock changes (increment stock for deleted sales)
        for (const item of sale.items) {
            await prisma.product.update({
                where: { id: item.productId },
                data: { currentStock: { increment: item.quantity } },
            });
        }

        await prisma.sale.delete({ where: { id } });

        return NextResponse.json({ message: 'Sale deleted successfully' });
    } catch (err) {
        console.error('Sale DELETE:', err);
        return NextResponse.json({ error: 'Failed to delete sale' }, { status: 500 });
    }
}
