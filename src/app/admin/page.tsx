import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import AddProductForm from "@/components/admin/AddProductForm";
import AddStockForm from "@/components/admin/AddStockForm";

const PAGE_SIZE = 20;

const dateFormat = new Intl.DateTimeFormat("ms-MY", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kuala_Lumpur",
});

async function AdminContent({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  await connection();
  const { page: pageParam } = await searchParams;
  const raw = Number(Array.isArray(pageParam) ? pageParam[0] : pageParam);
  const requestedPage = Number.isInteger(raw) && raw >= 1 ? raw : 1;

  const [drawer, products, totalCount] = await Promise.all([
    prisma.registerDrawer.findUnique({ where: { id: 1 } }),
    prisma.product.findMany({
      include: { inventory: true },
      orderBy: { name: "asc" },
    }),
    prisma.transaction.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  const transactions = await prisma.transaction.findMany({
    include: { product: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const stockProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    stock: p.inventory?.quantity ?? 0,
  }));

  const linkClass =
    "touch-manipulation rounded-xl bg-blue-600 px-6 py-4 text-xl font-bold text-white active:bg-blue-800";
  const disabledClass =
    "rounded-xl bg-slate-300 px-6 py-4 text-xl font-bold text-slate-500";

  return (
    <>
      <section className="rounded-2xl bg-white p-6 shadow">
        <p className="text-xl text-slate-600">
          Kupon Fizikal Dijangka dalam Peti Wang
        </p>
        <p className="text-6xl font-extrabold text-blue-700">
          {drawer?.expectedPhysicalCoupons ?? 0}
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <AddProductForm />
        <AddStockForm products={stockProducts} />
      </div>

      <section className="space-y-4 rounded-2xl bg-white p-6 shadow">
        <h2 className="text-2xl font-bold">Log Transaksi</h2>

        {transactions.length === 0 ? (
          <p className="text-xl text-slate-500">Tiada transaksi lagi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-lg">
              <thead>
                <tr className="border-b-2 border-slate-300">
                  <th className="p-3">ID</th>
                  <th className="p-3">Tarikh &amp; Masa</th>
                  <th className="p-3">Produk</th>
                  <th className="p-3">Jenis</th>
                  <th className="p-3 text-right">Jumlah Kupon</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-slate-200">
                    <td className="p-3">{t.id}</td>
                    <td className="p-3">{dateFormat.format(t.createdAt)}</td>
                    <td className="p-3">{t.product.name}</td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-3 py-1 font-semibold ${
                          t.type === "IN"
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {t.type === "IN" ? "Masuk" : "Keluar"}
                      </span>
                    </td>
                    <td className="p-3 text-right font-semibold">
                      {t.couponTotal}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <nav className="flex items-center justify-between pt-2">
          {page > 1 ? (
            <Link href={`/admin?page=${page - 1}`} className={linkClass}>
              Sebelum
            </Link>
          ) : (
            <span className={disabledClass}>Sebelum</span>
          )}
          <span className="text-xl">
            Halaman {page} daripada {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={`/admin?page=${page + 1}`} className={linkClass}>
              Seterusnya
            </Link>
          ) : (
            <span className={disabledClass}>Seterusnya</span>
          )}
        </nav>
      </section>
    </>
  );
}

export default function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 bg-slate-100 p-6 text-slate-900">
      <h1 className="text-3xl font-bold">Papan Pemuka Admin</h1>
      <Suspense fallback={<p className="text-2xl">Memuatkan...</p>}>
        <AdminContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
