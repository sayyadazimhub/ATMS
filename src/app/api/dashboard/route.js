import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Default to last 30 days if not provided, but handle full range carefully
    // If no dates provided, we might default to "all time" or "this month", let's support "all time" via empty params or default to 30 days
    // Let's implement logic: if params provided, use them. Else default.

    let dateFilter = {};
    if (startDateParam && endDateParam) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDateParam),
          lte: new Date(endDateParam),
        },
      };
    }

    const [salesAgg, purchasesAgg, purchasesDue, lowStock] = await Promise.all([
      prisma.sale.aggregate({
        where: dateFilter,
        _sum: { totalAmount: true, totalProfit: true }
      }),
      prisma.purchase.aggregate({
        where: dateFilter,
        _sum: { totalAmount: true, paidAmount: true, dueAmount: true }
      }),
      prisma.purchase.aggregate({ _sum: { dueAmount: true } }), // Total due is always all-time
      prisma.product.findMany({
        where: { currentStock: { lte: 10 } },
        orderBy: { currentStock: 'asc' },
        take: 10,
      }),
    ]);

    // Fetch daily data for charts
    // Prisma doesn't natively group by date easily across DBs, so we fetch lightweight records and aggregate in JS
    // Limit to reasonable number of records if range is large, but for dashboard usually okay
    const [salesRaw, purchasesRaw] = await Promise.all([
      prisma.sale.findMany({
        where: dateFilter,
        select: { createdAt: true, totalAmount: true, totalProfit: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.purchase.findMany({
        where: dateFilter,
        select: { createdAt: true, totalAmount: true },
        orderBy: { createdAt: 'asc' },
      })
    ]);

    // Aggregate by date (YYYY-MM-DD)
    const chartMap = new Map();

    salesRaw.forEach(s => {
      const date = new Date(s.createdAt).toLocaleDateString('en-CA'); // YYYY-MM-DD
      if (!chartMap.has(date)) chartMap.set(date, { date, sales: 0, profit: 0, purchases: 0 });
      const entry = chartMap.get(date);
      entry.sales += s.totalAmount;
      entry.profit += s.totalProfit;
    });

    purchasesRaw.forEach(p => {
      const date = new Date(p.createdAt).toLocaleDateString('en-CA');
      if (!chartMap.has(date)) chartMap.set(date, { date, sales: 0, profit: 0, purchases: 0 });
      const entry = chartMap.get(date);
      entry.purchases += p.totalAmount;
    });

    // Sort by date and convert to array
    const chartData = Array.from(chartMap.values()).sort((a, b) => a.date.localeCompare(b.date));


    const totalSales = salesAgg._sum.totalAmount ?? 0;
    const totalProfit = salesAgg._sum.totalProfit ?? 0;
    const totalPurchases = purchasesAgg._sum.totalAmount ?? 0;
    const totalDueToProviders = purchasesDue._sum.dueAmount ?? 0; // Keep all-time due

    const [recentSales, recentPurchases] = await Promise.all([
      prisma.sale.findMany({
        where: dateFilter,
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.purchase.findMany({
        where: dateFilter,
        include: { provider: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      summary: {
        totalSales,
        totalPurchases,
        totalProfit,
        totalDueToProviders,
        totalDueFromCustomers: 0,
      },
      lowStockProducts: lowStock,
      recentTransactions: { sales: recentSales, purchases: recentPurchases },
      chartData,
    });
  } catch (err) {
    console.error('Dashboard GET:', err);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}
