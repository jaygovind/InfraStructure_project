
#!/bin/sh
set -e
echo "Running Prisma migrate deploy..."
npx prisma migrate deploy
echo "Seeding database (idempotent upsert)..."
node prisma/seed.cjs || true
echo "Starting app..."
node dist/main.js
