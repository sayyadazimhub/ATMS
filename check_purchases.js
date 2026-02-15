const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.purchase.count();
        console.log(`Total purchases: ${count}`);

        if (count > 0) {
            const purchases = await prisma.purchase.findMany({
                take: 5,
                include: { provider: true }
            });
            console.log('Sample purchases:', JSON.stringify(purchases, null, 2));
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
