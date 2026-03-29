import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL
});
const prisma = new PrismaClient({ adapter });

const tranches = [
	{ order: 1, name: 'Founding Member', priceCents: 14900, capacity: 100 },
	{ order: 2, name: 'Early Access',    priceCents: 19900, capacity: 400 },
	{ order: 3, name: 'Standard',        priceCents: 24900, capacity: 1000 },
	{ order: 4, name: 'Full Price',      priceCents: 30000, capacity: 4500 },
];

async function main() {
	const existing = await prisma.tranche.findFirst();

	if (existing) {
		console.log('Tranches already seeded — skipping.');
		return;
	}

	for (const tranche of tranches) {
		await prisma.tranche.create({ data: tranche });
	}

	console.log('Tranches seeded: 4 tranches, 6000 licenses total.');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());