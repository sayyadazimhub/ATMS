const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const provider = await prisma.provider.findFirst();
        const product = await prisma.product.findFirst();

        if (!provider || !product) {
            console.log('Need provider and product to create sample purchase.');
            return;
        }

        const purchase = await prisma.purchase.create({
            data: {
                providerId: provider.id,
                totalAmount: 1000,
                paidAmount: 500,
                dueAmount: 500,
                items: {
                    create: [{
                        productId: product.id,
                        quantity: 10,
                        unitPrice: 100,
                        totalPrice: 1000
                    }]
                }
            },
            include: { provider: true, items: { include: { product: true } } }
        });
        console.log('Created sample purchase:', purchase.id);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
