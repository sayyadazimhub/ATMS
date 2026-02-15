const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const deleted = await prisma.purchase.deleteMany({});
        console.log(`Deleted ${deleted.count} purchases.`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
