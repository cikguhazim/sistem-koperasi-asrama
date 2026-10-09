import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import PosScreen, { type PosProduct } from "@/components/PosScreen";

async function Products() {
  await connection(); // sentiasa ambil stok terkini
  const rows = await prisma.product.findMany({
    include: { inventory: true },
    orderBy: { name: "asc" },
  });

  const products: PosProduct[] = rows.map((p) => ({
    id: p.id,
    name: p.name,
    priceInCoupons: p.priceInCoupons,
    imageUrl: p.imageUrl,
    stock: p.inventory?.quantity ?? 0,
  }));

  return <PosScreen products={products} />;
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center bg-slate-50 text-xl text-slate-400">
          Memuatkan produk...
        </div>
      }
    >
      <Products />
    </Suspense>
  );
}
