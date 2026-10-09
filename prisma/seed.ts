import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const products = [
  {
    name: "Syampu",
    priceInCoupons: 5,
    imageUrl: "https://placehold.co/400x400/png?text=Syampu",
    category: "Keperluan Harian",
    quantity: 50,
  },
  {
    name: "Sabun Mandi",
    priceInCoupons: 3,
    imageUrl: "https://placehold.co/400x400/png?text=Sabun+Mandi",
    category: "Keperluan Harian",
    quantity: 50,
  },
  {
    name: "Selipar",
    priceInCoupons: 8,
    imageUrl: "https://placehold.co/400x400/png?text=Selipar",
    category: "Keperluan Harian",
    quantity: 30,
  },
];

async function main() {
  // Safe to re-run: products that already exist (by name) are left untouched.
  for (const { quantity, ...data } of products) {
    const existing = await prisma.product.findFirst({
      where: { name: data.name },
    });
    if (existing) {
      console.log(`Skip (sudah ada): ${data.name}`);
      continue;
    }
    await prisma.product.create({
      data: { ...data, inventory: { create: { quantity } } },
    });
    console.log(`Dicipta: ${data.name}`);
  }

  await prisma.registerDrawer.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, expectedPhysicalCoupons: 0 },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
