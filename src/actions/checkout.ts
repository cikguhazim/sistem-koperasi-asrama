"use server";

import { prisma } from "@/lib/prisma";

export type CheckoutItem = { productId: number; quantity: number };

export type CheckoutResult =
  | { success: true; couponTotal: number }
  | { success: false; error: string };

export async function completeSale(
  items: CheckoutItem[],
): Promise<CheckoutResult> {
  if (!Array.isArray(items) || items.length === 0) {
    return { success: false, error: "Cart is empty." };
  }

  // Merge duplicate product IDs and validate quantities.
  const merged = new Map<number, number>();
  for (const { productId, quantity } of items) {
    if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity <= 0) {
      return { success: false, error: "Invalid product ID or quantity." };
    }
    merged.set(productId, (merged.get(productId) ?? 0) + quantity);
  }

  try {
    const couponTotal = await prisma.$transaction(async (tx) => {
      let saleTotal = 0;

      for (const [productId, quantity] of merged) {
        const product = await tx.product.findUnique({
          where: { id: productId },
          include: { inventory: true },
        });
        if (!product) throw new Error(`Product ${productId} not found.`);

        if (!product.inventory || product.inventory.quantity < quantity) {
          throw new Error(
            `Not enough stock for "${product.name}" (have ${product.inventory?.quantity ?? 0}, need ${quantity}).`,
          );
        }

        // Guarded decrement: only succeeds if stock is still sufficient.
        const updated = await tx.inventory.updateMany({
          where: { productId, quantity: { gte: quantity } },
          data: { quantity: { decrement: quantity } },
        });
        if (updated.count === 0) {
          throw new Error(`Not enough stock for "${product.name}".`);
        }

        const lineTotal = product.priceInCoupons * quantity;
        saleTotal += lineTotal;

        await tx.transaction.create({
          data: { productId, type: "OUT", couponTotal: lineTotal },
        });
      }

      await tx.registerDrawer.upsert({
        where: { id: 1 },
        update: { expectedPhysicalCoupons: { increment: saleTotal } },
        create: { id: 1, expectedPhysicalCoupons: saleTotal },
      });

      return saleTotal;
    });

    return { success: true, couponTotal };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Checkout failed.",
    };
  }
}
