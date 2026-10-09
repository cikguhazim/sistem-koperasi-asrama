"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/session";
import type { ActionResult } from "@/actions/inventory";

class UserError extends Error {}

export async function deleteTransaction(
  transactionId: string,
): Promise<ActionResult> {
  if (!(await isAdmin())) {
    return { success: false, message: "Tidak dibenarkan. Sila log masuk semula." };
  }

  const id = Number(transactionId);
  if (!Number.isInteger(id) || id <= 0) {
    return { success: false, message: "Transaksi tidak sah." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const t = await tx.transaction.findUnique({
        where: { id },
        include: { product: true },
      });
      if (!t) throw new UserError("Transaksi tidak dijumpai. Mungkin sudah dipadam.");

      // Rekod baharu menyimpan kuantiti; rekod lama dianggar daripada harga semasa.
      let quantity = t.quantity;
      if (quantity == null) {
        const price = t.product.priceInCoupons;
        if (price <= 0 || t.couponTotal % price !== 0) {
          throw new UserError(
            "Kuantiti transaksi lama ini tidak dapat dipastikan kerana harga telah berubah. Ia tidak boleh dipadam secara automatik.",
          );
        }
        quantity = t.couponTotal / price;
      }

      if (t.type === "OUT") {
        // Jualan dibatalkan: pulangkan stok dan tolak kupon dalam peti wang.
        await tx.inventory.upsert({
          where: { productId: t.productId },
          update: { quantity: { increment: quantity } },
          create: { productId: t.productId, quantity },
        });

        const drawer = await tx.registerDrawer.findUnique({ where: { id: 1 } });
        const current = drawer?.expectedPhysicalCoupons ?? 0;
        await tx.registerDrawer.upsert({
          where: { id: 1 },
          update: { expectedPhysicalCoupons: Math.max(0, current - t.couponTotal) },
          create: { id: 1, expectedPhysicalCoupons: 0 },
        });
      } else {
        // Tambah stok dibatalkan: kurangkan stok.
        const inv = await tx.inventory.findUnique({ where: { productId: t.productId } });
        if (!inv || inv.quantity < quantity) {
          throw new UserError(
            `Stok "${t.product.name}" tidak mencukupi untuk membatalkan penambahan ${quantity} unit ini (stok semasa: ${inv?.quantity ?? 0}).`,
          );
        }
        await tx.inventory.update({
          where: { productId: t.productId },
          data: { quantity: { decrement: quantity } },
        });
      }

      await tx.transaction.delete({ where: { id } });
    });
  } catch (e) {
    if (e instanceof UserError) return { success: false, message: e.message };
    return { success: false, message: "Gagal memadam transaksi. Sila cuba lagi." };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return {
    success: true,
    message: "Transaksi dipadam. Kupon dalam peti wang dan stok telah diselaraskan.",
  };
}
