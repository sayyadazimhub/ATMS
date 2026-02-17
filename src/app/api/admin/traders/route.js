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
        const search = searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;

        const where = {
            role: 'USER',
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ]
        };

        let salesStats = [];
        let traders = [];
        let total = 0;

        try {
            const [tradersRes, totalRes, statsRes] = await Promise.all([
                prisma.user.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        is_active: true,
                        createdAt: true,
                    }
                }),
                prisma.user.count({ where }),
                prisma.sale.groupBy({
                    by: ['userId'],
                    _sum: { totalAmount: true, totalProfit: true },
                    _count: { id: true }
                }).catch(() => []) // Catch internal prisma errors for groupBy
            ]);
            traders = tradersRes;
            total = totalRes;
            salesStats = statsRes;
        } catch (error) {
            console.error('Traders API aggregation error:', error);
            // Fallback: fetch traders at least
            traders = await prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: { id: true, name: true, email: true, phone: true, is_active: true, createdAt: true }
            });
            total = await prisma.user.count({ where });
        }

        return NextResponse.json({
            traders: traders.map(t => {
                const userStats = salesStats.find(s => s.userId === t.id);
                return {
                    id: t.id,
                    name: t.name,
                    email: t.email,
                    phone: t.phone || 'N/A',
                    is_active: t.is_active,
                    joined: t.createdAt,
                    revenue: userStats?._sum?.totalAmount || 0,
                    profit: userStats?._sum?.totalProfit || 0,
                    transactions: userStats?._count?.id || 0,
                };
            }),
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Admin traders API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const token = cookies().get('auth-token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id, status } = await request.json();

        const trader = await prisma.user.update({
            where: { id },
            data: { is_active: status === 'active' }
        });

        return NextResponse.json(trader);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update trader' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const token = cookies().get('auth-token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Trader ID is required' }, { status: 400 });

        await prisma.user.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Trader deleted successfully' });
    } catch (error) {
        console.error('Delete trader error:', error);
        return NextResponse.json({ error: 'Failed to delete trader' }, { status: 500 });
    }
}
