"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { completeSale } from "@/actions/checkout";

export type PosProduct = {
  id: number;
  name: string;
  priceInCoupons: number;
  imageUrl: string | null;
  stock: number;
};

type Notice = { kind: "ok" | "error"; text: string } | null;

export default function PosScreen({ products }: { products: PosProduct[] }) {
  const router = useRouter();
  const [cart, setCart] = useState<Record<number, number>>({});
  const [notice, setNotice] = useState<Notice>(null);
  const [pending, startTransition] = useTransition();

  const byId = new Map(products.map((p) => [p.id, p]));
  const lines = Object.entries(cart)
    .map(([id, qty]) => ({ product: byId.get(Number(id))!, qty }))
    .filter((l) => l.product);
  const total = lines.reduce((sum, l) => sum + l.product.priceInCoupons * l.qty, 0);

  function add(p: PosProduct) {
    setNotice(null);
    setCart((c) => {
      const next = (c[p.id] ?? 0) + 1;
      return next > p.stock ? c : { ...c, [p.id]: next };
    });
  }

  function remove(p: PosProduct) {
    setCart((c) => {
      const next = (c[p.id] ?? 0) - 1;
      const updated = { ...c };
      if (next > 0) updated[p.id] = next;
      else delete updated[p.id];
      return updated;
    });
  }

  function confirmSale() {
    startTransition(async () => {
      const result = await completeSale(
        lines.map((l) => ({ productId: l.product.id, quantity: l.qty })),
      );
      if (result.success) {
        setCart({});
        setNotice({
          kind: "ok",
          text: `Jualan berjaya! Kutip ${result.couponTotal} kupon.`,
        });
        router.refresh();
      } else {
        setNotice({ kind: "error", text: result.error });
      }
    });
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100 text-slate-900 select-none">
      {/* Kiri: senarai produk (70%) */}
      <main className="w-[70%] overflow-y-auto p-6">
        <header className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Koperasi Asrama Skubest</h1>
          <Link
            href="/admin"
            className="touch-manipulation rounded-lg bg-slate-800 px-6 py-3 text-xl font-medium text-white active:bg-slate-600"
          >
            ⚙ Papan Pemuka Admin
          </Link>
        </header>
        {products.length === 0 ? (
          <p className="text-xl text-slate-500">Tiada produk. Sila tambah produk dahulu.</p>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {products.map((p) => {
              const inCart = cart[p.id] ?? 0;
              const soldOut = p.stock - inCart <= 0;
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={soldOut}
                  onClick={() => add(p)}
                  className="relative flex touch-manipulation flex-col items-center gap-3 rounded-2xl bg-white p-6 text-xl shadow active:scale-95 active:bg-blue-100 disabled:opacity-40"
                >
                  {inCart > 0 && (
                    <span className="absolute right-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-lg font-bold text-white">
                      {inCart}
                    </span>
                  )}
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="aspect-square w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="aspect-square w-full rounded-xl bg-slate-200" />
                  )}
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-2xl font-bold text-blue-700">{p.priceInCoupons} kupon</span>
                  <span className="text-base text-slate-500">
                    {soldOut && p.stock === 0 ? "Stok habis" : `Stok: ${p.stock}`}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {/* Kanan: troli tetap (30%) */}
      <aside className="flex w-[30%] flex-col border-l-4 border-slate-300 bg-white">
        <h2 className="p-6 text-3xl font-bold">Troli</h2>

        <div className="flex-1 space-y-3 overflow-y-auto px-6">
          {lines.length === 0 ? (
            <p className="text-xl text-slate-500">Ketik produk untuk menambah.</p>
          ) : (
            lines.map(({ product, qty }) => (
              <div key={product.id} className="rounded-xl bg-slate-100 p-4">
                <div className="flex justify-between text-xl font-semibold">
                  <span>{product.name}</span>
                  <span>{product.priceInCoupons * qty}</span>
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => remove(product)}
                    className="touch-manipulation rounded-xl bg-slate-300 p-6 text-xl font-bold active:bg-slate-400"
                    aria-label={`Kurangkan ${product.name}`}
                  >
                    −
                  </button>
                  <span className="min-w-8 text-center text-2xl font-bold">{qty}</span>
                  <button
                    type="button"
                    onClick={() => add(product)}
                    disabled={qty >= product.stock}
                    className="touch-manipulation rounded-xl bg-slate-300 p-6 text-xl font-bold active:bg-slate-400 disabled:opacity-40"
                    aria-label={`Tambah ${product.name}`}
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4 border-t-4 border-slate-300 p-6">
          {notice && (
            <p
              className={`rounded-xl p-4 text-xl font-semibold ${
                notice.kind === "ok" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {notice.text}
            </p>
          )}
          <div>
            <p className="text-xl text-slate-600">Kupon Perlu Dikutip</p>
            <p className="text-6xl font-extrabold text-blue-700">{total}</p>
          </div>
          <button
            type="button"
            onClick={confirmSale}
            disabled={lines.length === 0 || pending}
            className="w-full touch-manipulation rounded-2xl bg-green-600 p-6 text-3xl font-extrabold text-white active:bg-green-800 disabled:bg-slate-300 disabled:text-slate-500"
          >
            {pending ? "Memproses..." : "Sahkan Jualan"}
          </button>
        </div>
      </aside>
    </div>
  );
}
