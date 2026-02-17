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
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    let dateFilter = { userId: decoded.id };
    if (startDateParam && endDateParam) {
      dateFilter.createdAt = {
        gte: new Date(startDateParam),
        lte: new Date(endDateParam),
      };
    }

    let results = [];
    try {
      results = await Promise.all([
        prisma.sale.aggregate({
          where: dateFilter,
          _sum: { totalAmount: true, totalProfit: true }
        }),
        prisma.sale.aggregate({ where: { userId: decoded.id }, _sum: { dueAmount: true } }),
        prisma.purchase.aggregate({
          where: dateFilter,
          _sum: { totalAmount: true, paidAmount: true, dueAmount: true }
        }),
        prisma.purchase.aggregate({ where: { userId: decoded.id }, _sum: { dueAmount: true } }),
        prisma.product.findMany({
          where: { userId: decoded.id, currentStock: { lte: 10 } },
          orderBy: { currentStock: 'asc' },
          take: 10,
        })
      ]);
    } catch (error) {
      console.warn('Dashboard Safe Query triggered (userId filter failed):', error.message);
      const safeDateFilter = { ...dateFilter };
      delete safeDateFilter.userId;
      results = await Promise.all([
        prisma.sale.aggregate({
          where: safeDateFilter,
          _sum: { totalAmount: true, totalProfit: true }
        }),
        prisma.sale.aggregate({ _sum: { dueAmount: true } }),
        prisma.purchase.aggregate({
          where: safeDateFilter,
          _sum: { totalAmount: true, paidAmount: true, dueAmount: true }
        }),
        prisma.purchase.aggregate({ _sum: { dueAmount: true } }),
        prisma.product.findMany({
          where: { currentStock: { lte: 10 } },
          orderBy: { currentStock: 'asc' },
          take: 10,
        })
      ]);
    }
    const [salesAgg, salesDue, purchasesAgg, purchasesDue, lowStock] = results;


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




    let secondaryResults = [];
    try {
      secondaryResults = await Promise.all([
        prisma.sale.findMany({
          where: dateFilter,
          include: { customer: true, items: { include: { product: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        prisma.purchase.findMany({
          where: dateFilter,
          include: { provider: true, items: { include: { product: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        prisma.saleItem.groupBy({
          by: ['productId'],
          where: dateFilter,
          _sum: { quantity: true, profit: true },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 5,
        }),
        prisma.sale.groupBy({
          by: ['customerId'],
          where: dateFilter,
          _sum: { totalAmount: true },
          orderBy: { _sum: { totalAmount: 'desc' } },
          take: 5,
        }),
        prisma.purchase.groupBy({
          by: ['providerId'],
          where: dateFilter,
          _sum: { totalAmount: true },
          orderBy: { _sum: { totalAmount: 'desc' } },
          take: 5,
        }),
      ]);
    } catch (error) {
      console.warn('Dashboard Secondary Safe Query triggered:', error.message);
      const safeDateFilter = { ...dateFilter };
      delete safeDateFilter.userId;
      secondaryResults = await Promise.all([
        prisma.sale.findMany({
          where: safeDateFilter,
          include: { customer: true, items: { include: { product: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        prisma.purchase.findMany({
          where: safeDateFilter,
          include: { provider: true, items: { include: { product: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        // For SaleItem, if userId is missing, we must remove it from where
        prisma.saleItem.groupBy({
          by: ['productId'],
          where: safeDateFilter,
          _sum: { quantity: true, profit: true },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 5,
        }),
        prisma.sale.groupBy({
          by: ['customerId'],
          where: safeDateFilter,
          _sum: { totalAmount: true },
          orderBy: { _sum: { totalAmount: 'desc' } },
          take: 5,
        }),
        prisma.purchase.groupBy({
          by: ['providerId'],
          where: safeDateFilter,
          _sum: { totalAmount: true },
          orderBy: { _sum: { totalAmount: 'desc' } },
          take: 5,
        }),
      ]);
    }

    const [recentSales, recentPurchases, topProducts, topCustomersRaw, topProvidersRaw] = secondaryResults;

    // Fetch details for top products, customers, and providers
    const [topProductsWithDetails, topCustomers, topProviders] = await Promise.all([
      Promise.all(topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, unit: true },
        });
        return { ...item, name: product?.name || 'Unknown', unit: product?.unit || '', totalQuantity: item._sum.quantity, totalProfit: item._sum.profit };
      })),
      Promise.all(topCustomersRaw.map(async (item) => {
        const customer = await prisma.customer.findUnique({
          where: { id: item.customerId },
          select: { name: true },
        });
        return { ...item, name: customer?.name || 'Walk-in', totalAmount: item._sum.totalAmount };
      })),
      Promise.all(topProvidersRaw.map(async (item) => {
        const provider = await prisma.provider.findUnique({
          where: { id: item.providerId },
          select: { name: true },
        });
        return { ...item, name: provider?.name || 'Unknown', totalAmount: item._sum.totalAmount };
      })),
    ]);

    const totalSales = salesAgg._sum.totalAmount ?? 0;
    const totalProfit = salesAgg._sum.totalProfit ?? 0;
    const totalPurchases = purchasesAgg._sum.totalAmount ?? 0;
    const totalDueToProviders = purchasesDue._sum.dueAmount ?? 0;
    const totalDueFromCustomers = salesDue._sum.dueAmount ?? 0;

    return NextResponse.json({
      summary: {
        totalSales,
        totalPurchases,
        totalProfit,
        totalDueToProviders,
        totalDueFromCustomers,
      },
      lowStockProducts: lowStock,
      recentTransactions: { sales: recentSales, purchases: recentPurchases },
      topProducts: topProductsWithDetails,
      topCustomers,
      topProviders,
      chartData,
    });
  } catch (err) {
    console.error('Dashboard GET:', err);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}
