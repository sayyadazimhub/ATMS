import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyUserToken } from '@/lib/jwt-user';

export async function GET() {
    try {
        const token = cookies().get('auth-token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = await verifyUserToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify if the user is an admin
        const admin = await prisma.admin.findUnique({
            where: { id: decoded.id }
        });

        if (!admin || admin.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized: Admin access only' }, { status: 403 });
        }

        // Comprehensive system stats
        const [
            totalTraders,
            activeTraders,
            salesAgg,
            purchasesAgg,
            salesCount,
            purchasesCount,
            recentTraders,
            allSales,
            allPurchases
        ] = await Promise.all([
            prisma.user.count({ where: { role: 'USER' } }),
            prisma.user.count({ where: { role: 'USER', is_active: true } }),
            prisma.sale.aggregate({
                where: { userId: { not: null } },
                _sum: { totalAmount: true, totalProfit: true }
            }),
            prisma.purchase.aggregate({
                where: { userId: { not: null } },
                _sum: { totalAmount: true }
            }),
            prisma.sale.count({ where: { userId: { not: null } } }),
            prisma.purchase.count({ where: { userId: { not: null } } }),
            prisma.user.findMany({
                where: { role: 'USER' },
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true
                }
            }),
            // Fetch sales for the last 6 months for chart (User-based only)
            prisma.sale.findMany({
                where: {
                    userId: { not: null },
                    createdAt: {
                        gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
                    }
                },
                select: { createdAt: true, totalAmount: true }
            }),
            prisma.purchase.findMany({
                where: {
                    userId: { not: null },
                    createdAt: {
                        gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
                    }
                },
                select: { createdAt: true, totalAmount: true }
            })
        ]);

        // Process chart data: Group by month
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyData = {};

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const mKey = monthNames[d.getMonth()];
            monthlyData[mKey] = { name: mKey, volume: 0 };
        }

        allSales.forEach(s => {
            const mKey = monthNames[new Date(s.createdAt).getMonth()];
            if (monthlyData[mKey]) monthlyData[mKey].volume += s.totalAmount;
        });
        allPurchases.forEach(p => {
            const mKey = monthNames[new Date(p.createdAt).getMonth()];
            if (monthlyData[mKey]) monthlyData[mKey].volume += p.totalAmount;
        });

        const chartData = Object.values(monthlyData);

        return NextResponse.json({
            summary: {
                totalTraders,
                activeTraders,
                totalTransactions: salesCount, // Match report page (Sales count only)
                totalVolume: salesAgg._sum.totalAmount || 0, // Match report page (Revenue = Sales total)
                totalProfit: salesAgg._sum.totalProfit || 0,
            },
            chartData,
            recentTraders: recentTraders.map(t => ({
                ...t,
                joined: t.createdAt // Map createdAt to joined for frontend
            }))
        });
    } catch (error) {
        console.error('Admin dashboard API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
