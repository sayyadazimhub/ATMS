import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        // For now, return default settings
        // In the future, you can store these in a Settings model per user
        const settings = {
            theme: 'light',
            notifications: {
                email: true,
                lowStock: true,
                newSale: false,
                newPurchase: false,
            },
            preferences: {
                currency: 'INR',
                dateFormat: 'DD/MM/YYYY',
                lowStockThreshold: 10,
            },
        };

        return NextResponse.json(settings);
    } catch (err) {
        console.error('Settings GET:', err);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();

        // For now, just return the updated settings
        // In the future, you can store these in a Settings model per user
        const settings = {
            theme: body.theme || 'light',
            notifications: body.notifications || {
                email: true,
                lowStock: true,
                newSale: false,
                newPurchase: false,
            },
            preferences: body.preferences || {
                currency: 'INR',
                dateFormat: 'DD/MM/YYYY',
                lowStockThreshold: 10,
            },
        };

        return NextResponse.json(settings);
    } catch (err) {
        console.error('Settings PUT:', err);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
