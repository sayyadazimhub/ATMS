import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'daily';
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    let startDate;
    let endDate;
    if (start && end) {
      startDate = new Date(start);
      endDate = new Date(end);
    } else {
      endDate = new Date();
      if (type === 'yearly') {
        startDate = new Date(endDate.getFullYear(), 0, 1);
      } else if (type === 'monthly') {
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
      } else {
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 30);
      }
    }
    const [sales, purchases] = await Promise.all([
      prisma.sale.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        include: { customer: true, items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.purchase.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        include: { provider: true, items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    const totalSales = sales.reduce((s, i) => s + i.totalAmount, 0);
    const totalProfit = sales.reduce((s, i) => s + i.totalProfit, 0);
    const totalPurchases = purchases.reduce((s, i) => s + i.totalAmount, 0);
    return NextResponse.json({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      type,
      totalSales,
      totalPurchases,
      totalProfit,
      netProfit: totalProfit,
      sales,
      purchases,
    });
  } catch (err) {
    console.error('Reports GET:', err);
    return NextResponse.json({ error: 'Failed to load reports' }, { status: 500 });
  }
}
