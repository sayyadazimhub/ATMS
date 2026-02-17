import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyUserToken } from '@/lib/jwt-user';

export async function GET(request, { params }) {
    try {
        const token = cookies().get('auth-token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = await verifyUserToken(token);
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = params;

        const [trader, stats, summary, recentSales] = await Promise.all([
            // Basic User Info
            prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    is_active: true,
                    createdAt: true,
                    role: true,
                }
            }),
            // Entity Counts
            Promise.all([
                prisma.customer.count({ where: { userId: id } }),
                prisma.provider.count({ where: { userId: id } }),
                prisma.product.count({ where: { userId: id } }),
            ]),
            // Aggregated Sales Data
            prisma.sale.aggregate({
                where: { userId: id },
                _sum: { totalAmount: true, totalProfit: true },
                _count: { id: true }
            }),
            // Recent Transactions
            prisma.sale.findMany({
                where: { userId: id },
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    customer: { select: { name: true } }
                }
            })
        ]);

        if (!trader) {
            return NextResponse.json({ error: 'Trader not found' }, { status: 404 });
        }

        return NextResponse.json({
            profile: trader,
            business: {
                totalCustomers: stats[0],
                totalProviders: stats[1],
                totalProducts: stats[2],
                totalTransactions: summary._count.id || 0,
                totalRevenue: summary._sum.totalAmount || 0,
                totalProfit: summary._sum.totalProfit || 0
            },
            recentSales: recentSales.map(s => ({
                id: s.id,
                customer: s.customer?.name || 'Walk-in Customer',
                amount: s.totalAmount,
                profit: s.totalProfit,
                date: s.createdAt
            }))
        });
    } catch (error) {
        console.error('Admin trader detail API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
