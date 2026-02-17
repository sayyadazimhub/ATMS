import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyUserToken } from '@/lib/jwt-user';

export async function GET() {
    try {
        const token = cookies().get('auth-token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = await verifyUserToken(token);
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const admin = await prisma.admin.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                is_active: true,
                createdAt: true
            }
        });

        if (!admin) return NextResponse.json({ error: 'Admin not found' }, { status: 404 });

        return NextResponse.json(admin);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const token = cookies().get('auth-token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = await verifyUserToken(token);
        const body = await request.json();

        const admin = await prisma.admin.update({
            where: { id: decoded.id },
            data: {
                name: body.name,
                phone: body.phone,
                email: body.email
            }
        });

        return NextResponse.json(admin);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
