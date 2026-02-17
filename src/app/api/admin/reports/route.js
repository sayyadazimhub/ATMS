import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyUserToken } from '@/lib/jwt-user';

export async function GET(request) {
    try {
        const token = cookies().get('auth-token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = await verifyUserToken(token);
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || '30d';

        // Calculate Start Date based on range
        let startDate = null;
        const now = new Date();
        if (range === '7d') {
            startDate = new Date(now.setDate(now.getDate() - 7));
        } else if (range === '30d') {
            startDate = new Date(now.setDate(now.getDate() - 30));
        } else if (range === '90d') {
            startDate = new Date(now.setDate(now.getDate() - 90));
        }

        // Adjust Start Date to beginning of day
        if (startDate) startDate.setHours(0, 0, 0, 0);

        // Calculate Timeline range (Last 6 Months always for chart continuity)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const whereClause = startDate ? {
            createdAt: { gte: startDate },
            userId: { not: null }
        } : { userId: { not: null } };

        const [overallStats, tradersBaseStats, recentSales, traderCount, productCount] = await Promise.all([
            // Overall Network Totals (Filtered by Range)
            prisma.sale.aggregate({
                where: whereClause,
                _sum: { totalAmount: true, totalProfit: true },
                _count: { id: true }
            }),
            // Trader Performance (Filtered by Range)
            prisma.sale.groupBy({
                by: ['userId'],
                where: whereClause,
                _sum: { totalAmount: true, totalProfit: true },
                orderBy: { _sum: { totalAmount: 'desc' } },
                take: 5
            }),
            // Recent Sales for Timeline (Last 6 Months always for the big chart balance)
            prisma.sale.findMany({
                where: {
                    createdAt: { gte: sixMonthsAgo },
                    userId: { not: null }
                },
                select: { createdAt: true, totalAmount: true, totalProfit: true },
                orderBy: { createdAt: 'asc' }
            }),
            prisma.user.count({ where: { role: 'USER' } }),
            prisma.product.count()
        ]);

        // Process Revenue Flow (Group by Month)
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyAggregation = {};

        // Initialize last 6 months
        for (let i = 0; i < 6; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const mKey = `${monthNames[d.getMonth()]}`;
            monthlyAggregation[mKey] = { month: mKey, revenue: 0, profit: 0, order: 6 - i };
        }

        recentSales.forEach(sale => {
            const mKey = monthNames[new Date(sale.createdAt).getMonth()];
            if (monthlyAggregation[mKey]) {
                monthlyAggregation[mKey].revenue += sale.totalAmount;
                monthlyAggregation[mKey].profit += sale.totalProfit;
            }
        });

        const revenueData = Object.values(monthlyAggregation).sort((a, b) => a.order - b.order);

        // Process Trader Performance (Fetch Names)
        const userIds = tradersBaseStats.map(s => s.userId).filter(Boolean);
        const tradersList = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true }
        });

        // Filter out any traders that might have been deleted but still have sales
        const traderPerformance = tradersBaseStats
            .map(stat => {
                const trader = tradersList.find(u => u.id === stat.userId);
                if (!trader) return null;
                return {
                    name: trader.name,
                    volume: stat._sum.totalAmount || 0,
                    profit: stat._sum.totalProfit || 0
                };
            })
            .filter(Boolean); // Remove nulls (deleted/unknown users)

        // Process Category Share (Top 4 Products from valid sales within range)
        const itemStats = await prisma.saleItem.groupBy({
            by: ['productId'],
            where: {
                userId: { not: null },
                createdAt: startDate ? { gte: startDate } : undefined
            },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 4
        });

        const products = await prisma.product.findMany({
            where: { id: { in: itemStats.map(s => s.productId) } },
            select: { id: true, name: true }
        });

        const categoryShare = itemStats.map(stat => ({
            name: products.find(p => p.id === stat.productId)?.name || 'Commodity',
            value: stat._sum.quantity || 0
        }));

        return NextResponse.json({
            revenueData,
            traderPerformance: traderPerformance.length > 0 ? traderPerformance : [
                { name: 'No Data Yet', volume: 0, profit: 0 }
            ],
            categoryShare: categoryShare.length > 0 ? categoryShare : [
                { name: 'No Sales', value: 100 }
            ],
            metrics: {
                totalRevenue: overallStats._sum.totalAmount || 0,
                totalProfit: overallStats._sum.totalProfit || 0,
                traderCount: traderCount,
                transactionCount: overallStats._count.id
            }
        });
    } catch (error) {
        console.error('Reports Real Data API Error:', error);
        return NextResponse.json({ error: 'Report generation failed' }, { status: 500 });
    }
}
