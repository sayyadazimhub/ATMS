import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
    });
    if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(customer);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { name, phone, address } = body;
    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        ...(name != null && { name }),
        ...(phone != null && { phone }),
        ...(address != null && { address }),
      },
    });
    return NextResponse.json(customer);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.customer.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
