"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/session";
import type { ActionResult } from "@/actions/inventory";

const UNAUTHORIZED: ActionResult = {
  success: false,
  message: "Tidak dibenarkan. Sila log masuk semula.",
};

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateProduct(
  productId: number,
  newStock: number,
  newImageUrl: string,
  newPriceInCoupons: number,
): Promise<ActionResult> {
  if (!(await isAdmin())) return UNAUTHORIZED;

  if (!Number.isInteger(productId) || productId <= 0) {
    return { success: false, message: "Produk tidak sah." };
  }
  if (!Number.isInteger(newStock) || newStock < 0) {
    return { success: false, message: "Stok mestilah nombor bulat 0 atau lebih." };
  }
  if (!Number.isInteger(newPriceInCoupons) || newPriceInCoupons <= 0) {
    return { success: false, message: "Harga kupon mestilah nombor bulat lebih daripada 0." };
  }
  const imageUrl = String(newImageUrl ?? "").trim();
  if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
    return { success: false, message: "Pautan gambar mesti bermula dengan http:// atau https://." };
  }

  try {
    const name = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error("not-found");

      await tx.product.update({
        where: { id: productId },
        data: { imageUrl: imageUrl || null, priceInCoupons: newPriceInCoupons },
      });
      await tx.inventory.upsert({
        where: { productId },
        update: { quantity: newStock },
        create: { productId, quantity: newStock },
      });
      return product.name;
    });

    refresh();
    return { success: true, message: `"${name}" berjaya dikemaskini!` };
  } catch (e) {
    if (e instanceof Error && e.message === "not-found") {
      return { success: false, message: "Produk tidak dijumpai." };
    }
    return { success: false, message: "Gagal mengemaskini produk. Sila cuba lagi." };
  }
}

export async function deleteProduct(productId: number): Promise<ActionResult> {
  if (!(await isAdmin())) return UNAUTHORIZED;

  if (!Number.isInteger(productId) || productId <= 0) {
    return { success: false, message: "Produk tidak sah." };
  }

  try {
    // Inventori dan sejarah transaksi dipadam sekali (onDelete: Cascade).
    const product = await prisma.product.delete({ where: { id: productId } });
    refresh();
    return { success: true, message: `"${product.name}" telah dipadam.` };
  } catch {
    return { success: false, message: "Gagal memadam produk. Mungkin ia sudah dipadam." };
  }
}
