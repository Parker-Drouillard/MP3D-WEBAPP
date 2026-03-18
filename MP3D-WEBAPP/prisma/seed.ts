import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.licenseSlot.findUnique({
    where: { id: 1 }
  });

  if (existing) {
    console.log('License slots already seeded — skipping.');
    return;
  }

  await prisma.licenseSlot.create({
    data: {
      id: 1,
      totalSlots: 5300,
      soldCount: 0
    }
  });

  console.log('License slots seeded: 5300 total slots.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());