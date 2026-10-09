import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { btnBase, btnDark, btnPrimary, card } from "@/lib/ui";
import AddProductForm from "@/components/admin/AddProductForm";
import AddStockForm from "@/components/admin/AddStockForm";
import ManageProducts from "@/components/admin/ManageProducts";
import DeleteTransactionButton from "@/components/admin/DeleteTransactionButton";
import Toaster from "@/components/admin/Toaster";
import {
  IconArrowLeft,
  IconBox,
  IconList,
  IconWallet,
} from "@/components/icons";

const PAGE_SIZE = 20;

const dateFormat = new Intl.DateTimeFormat("ms-MY", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kuala_Lumpur",
});

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className={`${card} space-y-5 p-6`}>
      <h2 className="flex items-center gap-3 text-xl font-bold">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

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

  const managedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    imageUrl: p.imageUrl,
    priceInCoupons: p.priceInCoupons,
    stock: p.inventory?.quantity ?? 0,
  }));

  return (
    <>
      <Toaster />

      {/* Kad statistik */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm md:col-span-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                Kupon Fizikal Dijangka dalam Peti Wang
              </p>
              <p className="mt-2 text-6xl font-extrabold tabular-nums leading-none text-emerald-700">
                {drawer?.expectedPhysicalCoupons ?? 0}
              </p>
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
              <IconWallet width="1.5em" height="1.5em" />
            </span>
          </div>
        </div>

        <div className={`${card} flex items-center gap-4 p-6`}>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <IconBox width="1.5em" height="1.5em" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-500">Jenis Produk</p>
            <p className="text-4xl font-extrabold tabular-nums">{products.length}</p>
          </div>
        </div>

        <div className={`${card} flex items-center gap-4 p-6`}>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
            <IconList width="1.5em" height="1.5em" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-500">Jumlah Transaksi</p>
            <p className="text-4xl font-extrabold tabular-nums">{totalCount}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AddProductForm />
        <AddStockForm products={stockProducts} />
      </div>

      <Section title="Urus Produk" icon={<IconBox />}>
        <ManageProducts products={managedProducts} />
      </Section>

      <Section title="Log Transaksi" icon={<IconList />}>
        {transactions.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-4 text-lg text-slate-500">
            Tiada transaksi lagi.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200/80">
            <table className="w-full min-w-[40rem] text-left text-base">
              <thead className="bg-slate-100 text-sm uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Tarikh &amp; Masa</th>
                  <th className="px-4 py-3 font-semibold">Produk</th>
                  <th className="px-4 py-3 font-semibold">Jenis</th>
                  <th className="px-4 py-3 text-right font-semibold">Jumlah Kupon</th>
                  <th className="px-4 py-3 text-right font-semibold">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-t border-slate-100 odd:bg-white even:bg-slate-50/70">
                    <td className="px-4 py-3 tabular-nums text-slate-500">{t.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {dateFormat.format(t.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-medium">{t.product.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                          t.type === "IN"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {t.type === "IN" ? "Masuk" : "Keluar"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-lg font-bold tabular-nums">
                      {t.couponTotal}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DeleteTransactionButton id={t.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <nav className="flex items-center justify-between gap-3">
          {page > 1 ? (
            <Link href={`/admin?page=${page - 1}`} className={btnPrimary}>
              Sebelum
            </Link>
          ) : (
            <span className={`${btnBase} bg-slate-100 text-slate-400`}>Sebelum</span>
          )}
          <span className="text-base font-medium text-slate-600">
            Halaman {page} daripada {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={`/admin?page=${page + 1}`} className={btnPrimary}>
              Seterusnya
            </Link>
          ) : (
            <span className={`${btnBase} bg-slate-100 text-slate-400`}>Seterusnya</span>
          )}
        </nav>
      </Section>
    </>
  );
}

function LoadingState() {
  return (
    <div className={`${card} animate-pulse p-10 text-center text-xl text-slate-400`}>
      Memuatkan...
    </div>
  );
}

export default function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-xl font-extrabold text-white">
              K
            </div>
            <h1 className="text-xl font-bold md:text-2xl">Papan Pemuka Admin</h1>
          </div>
          <Link href="/" className={btnDark}>
            <IconArrowLeft />
            Kembali ke POS
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-6 px-5 py-6">
        <Suspense fallback={<LoadingState />}>
          <AdminContent searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}
