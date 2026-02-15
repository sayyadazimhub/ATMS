import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyUserToken } from '@/lib/jwt-user';

export async function GET(request) {
    try {
        // Get token from cookie
        const token = request.cookies.get('user-token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = await verifyUserToken(token);
        if (!decoded || !decoded.id) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const profile = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!profile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(profile);
    } catch (err) {
        console.error('Profile GET:', err);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        // Get token from cookie
        const token = request.cookies.get('user-token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = await verifyUserToken(token);
        if (!decoded || !decoded.id) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const body = await request.json();
        const { name, phone } = body;

        if (!name || name.trim().length === 0) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const updated = await prisma.user.update({
            where: { id: decoded.id },
            data: {
                name: name.trim(),
                phone: phone?.trim() || null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(updated);
    } catch (err) {
        console.error('Profile PUT:', err);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
