"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, isValidToken } from "@/lib/auth";

export type ActionResult =
  | { success: true; message: string }
  | { success: false; message: string };

async function isAdmin() {
  return isValidToken((await cookies()).get(ADMIN_COOKIE)?.value);
}

const UNAUTHORIZED: ActionResult = {
  success: false,
  message: "Tidak dibenarkan. Sila log masuk semula.",
};

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function createProduct(formData: FormData): Promise<ActionResult> {
  if (!(await isAdmin())) return UNAUTHORIZED;
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const price = Number(formData.get("priceInCoupons"));
  const stock = Number(formData.get("initialStock"));

  if (!name || !category) {
    return { success: false, message: "Nama dan kategori wajib diisi." };
  }
  if (!Number.isInteger(price) || price <= 0) {
    return { success: false, message: "Harga kupon mestilah nombor bulat lebih daripada 0." };
  }
  if (!Number.isInteger(stock) || stock < 0) {
    return { success: false, message: "Stok awal mestilah nombor bulat 0 atau lebih." };
  }
  if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
    return { success: false, message: "Pautan gambar mesti bermula dengan http:// atau https://." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name,
          category,
          priceInCoupons: price,
          imageUrl: imageUrl || null,
          inventory: { create: { quantity: stock } },
        },
      });
      if (stock > 0) {
        await tx.transaction.create({
          data: { productId: product.id, type: "IN", couponTotal: price * stock },
        });
      }
    });
  } catch {
    return { success: false, message: "Gagal menambah produk. Sila cuba lagi." };
  }

  refresh();
  return { success: true, message: `Produk "${name}" berjaya ditambah!` };
}

export async function addStock(formData: FormData): Promise<ActionResult> {
  if (!(await isAdmin())) return UNAUTHORIZED;
  const productId = Number(formData.get("productId"));
  const quantity = Number(formData.get("quantity"));

  if (!Number.isInteger(productId) || productId <= 0) {
    return { success: false, message: "Sila pilih produk." };
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { success: false, message: "Kuantiti mestilah nombor bulat lebih daripada 0." };
  }

  try {
    const name = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error("not-found");

      await tx.inventory.upsert({
        where: { productId },
        update: { quantity: { increment: quantity } },
        create: { productId, quantity },
      });
      await tx.transaction.create({
        data: {
          productId,
          type: "IN",
          couponTotal: product.priceInCoupons * quantity,
        },
      });
      return product.name;
    });

    refresh();
    return { success: true, message: `Stok "${name}" bertambah ${quantity}. Berjaya!` };
  } catch (e) {
    if (e instanceof Error && e.message === "not-found") {
      return { success: false, message: "Produk tidak dijumpai." };
    }
    return { success: false, message: "Gagal menambah stok. Sila cuba lagi." };
  }
}
