
/* apps/backend/prisma/seed.cjs */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com';
  const password = 'admin'; // NOTE: In production, hash passwords!
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, password, name: 'Admin' },
  });
  console.log('Seeded admin user:', email, '/', password);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
