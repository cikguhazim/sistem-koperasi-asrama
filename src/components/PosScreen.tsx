"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { completeSale } from "@/actions/checkout";
import Logo from "@/components/Logo";
import VirtualKeyboard from "@/components/pos/VirtualKeyboard";
import { alertErr, alertOk } from "@/lib/ui";
import {
  IconBox,
  IconCart,
  IconCheck,
  IconCoins,
  IconGear,
  IconMinus,
  IconPlus,
  IconSearch,
  IconX,
} from "@/components/icons";

export type PosProduct = {
  id: number;
  name: string;
  priceInCoupons: number;
  imageUrl: string | null;
  category: string;
  stock: number;
};

type Notice = { kind: "ok" | "error"; text: string } | null;

const LOW_STOCK = 5;

// Kesan sama ada dibuka sebagai aplikasi (Skrin Utama iPad) dan bukan dalam Safari.
function subscribeStandalone(cb: () => void) {
  const m = window.matchMedia("(display-mode: standalone)");
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}
function getStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function Stepper({
  qty,
  onMinus,
  onPlus,
  plusDisabled,
  label,
}: {
  qty: number;
  onMinus: () => void;
  onPlus: () => void;
  plusDisabled: boolean;
  label: string;
}) {
  const btn =
    "flex h-12 w-12 touch-manipulation items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 transition active:scale-95 active:bg-slate-100 disabled:opacity-40";
  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl bg-slate-100 p-1.5">
      <button type="button" onClick={onMinus} className={btn} aria-label={`Kurangkan ${label}`}>
        <IconMinus />
      </button>
      <span className="min-w-8 text-center text-xl font-bold tabular-nums">{qty}</span>
      <button
        type="button"
        onClick={onPlus}
        disabled={plusDisabled}
        className={btn}
        aria-label={`Tambah ${label}`}
      >
        <IconPlus />
      </button>
    </div>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0)
    return (
      <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-700">
        Stok habis
      </span>
    );
  if (stock <= LOW_STOCK)
    return (
      <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
        Stok rendah: {stock}
      </span>
    );
  return (
    <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
      Stok: {stock}
    </span>
  );
}

export default function PosScreen({ products }: { products: PosProduct[] }) {
  const router = useRouter();
  const [cart, setCart] = useState<Record<number, number>>({});
  const [notice, setNotice] = useState<Notice>(null);
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [kbOpen, setKbOpen] = useState(false);
  const standalone = useSyncExternalStore(subscribeStandalone, getStandalone, () => false);

  const byId = new Map(products.map((p) => [p.id, p]));
  const lines = Object.entries(cart)
    .map(([id, qty]) => ({ product: byId.get(Number(id))!, qty }))
    .filter((l) => l.product);
  const total = lines.reduce((sum, l) => sum + l.product.priceInCoupons * l.qty, 0);
  const itemCount = lines.reduce((sum, l) => sum + l.qty, 0);

  const q = query.trim().toLowerCase();
  const visible = q
    ? products.filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q),
      )
    : products;

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
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-slate-50 text-slate-900 select-none">
      {/* Bar atas */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200/80 bg-white px-5 py-3 shadow-sm">
        <div className="flex min-w-0 items-center gap-3">
          <Logo className="h-12 shrink-0" />
          <h1 className="truncate text-xl font-bold md:text-2xl">Koperasi Asrama</h1>
          {standalone && (
            <span className="hidden rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-200 sm:inline">
              Mod Aplikasi
            </span>
          )}
        </div>
        <Link
          href="/admin"
          aria-label="Papan Pemuka Admin"
          title="Papan Pemuka Admin"
          className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-xl text-slate-300 transition active:bg-slate-100 active:text-slate-600"
        >
          <IconGear width="1.4em" height="1.4em" />
        </Link>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Kiri: carian + senarai produk + papan kekunci maya */}
        <section className="flex min-h-0 flex-1 flex-col lg:w-[70%] lg:flex-none">
          <div className="shrink-0 border-b border-slate-200/80 bg-white px-5 py-3">
            <div
              className={`flex items-center gap-3 rounded-2xl border bg-slate-50 pl-4 pr-2 transition ${
                kbOpen
                  ? "border-indigo-500 ring-4 ring-indigo-100"
                  : "border-slate-300"
              }`}
            >
              <IconSearch className="shrink-0 text-slate-400" width="1.4em" height="1.4em" />
              <input
                type="text"
                readOnly
                inputMode="none"
                value={query}
                onClick={() => setKbOpen(true)}
                onFocus={() => setKbOpen(true)}
                placeholder="Cari produk atau kategori..."
                aria-label="Cari produk atau kategori"
                className="min-h-14 min-w-0 flex-1 cursor-pointer bg-transparent text-xl text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Kosongkan carian"
                  className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-xl text-slate-500 transition active:scale-95 active:bg-slate-200"
                >
                  <IconX />
                </button>
              )}
            </div>
          </div>

        <main className="min-h-0 flex-1 overflow-y-auto p-5">
          {products.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400">
              <IconBox width="3em" height="3em" />
              <p className="text-xl">Tiada produk. Sila tambah produk dahulu.</p>
            </div>
          ) : visible.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400">
              <IconSearch width="3em" height="3em" />
              <p className="text-xl font-medium">Tiada barangan ditemui</p>
              <p className="text-base">Cuba kata kunci lain atau kosongkan carian.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {visible.map((p) => {
                const inCart = cart[p.id] ?? 0;
                const soldOut = p.stock - inCart <= 0;
                return (
                  <div
                    key={p.id}
                    className={`flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
                      inCart > 0 ? "border-indigo-400 ring-2 ring-indigo-200" : "border-slate-200/80"
                    } ${p.stock <= 0 ? "opacity-60" : ""}`}
                  >
                    <button
                      type="button"
                      disabled={soldOut}
                      onClick={() => add(p)}
                      className="flex flex-1 touch-manipulation flex-col text-left transition active:bg-indigo-50 disabled:cursor-not-allowed"
                      aria-label={`Tambah ${p.name} ke troli`}
                    >
                      <div className="relative aspect-square w-full bg-slate-100">
                        {p.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="h-full w-full object-cover"
                            draggable={false}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-300">
                            <IconBox width="3em" height="3em" />
                          </div>
                        )}
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-slate-900/85 px-3 py-1.5 text-base font-bold text-white backdrop-blur">
                          <IconCoins width="1em" height="1em" />
                          {p.priceInCoupons} kupon
                        </span>
                        {inCart > 0 && (
                          <span className="absolute right-3 top-3 flex h-9 min-w-9 items-center justify-center rounded-full bg-indigo-600 px-2 text-base font-bold text-white shadow">
                            {inCart}
                          </span>
                        )}
                      </div>
                      <div className="space-y-2 p-4 pb-3">
                        <p className="text-lg font-semibold leading-snug">{p.name}</p>
                        <StockBadge stock={p.stock} />
                      </div>
                    </button>

                    <div className="p-3 pt-0">
                      {inCart > 0 ? (
                        <Stepper
                          qty={inCart}
                          onMinus={() => remove(p)}
                          onPlus={() => add(p)}
                          plusDisabled={soldOut}
                          label={p.name}
                        />
                      ) : (
                        <button
                          type="button"
                          disabled={soldOut}
                          onClick={() => add(p)}
                          className="flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-2xl bg-indigo-50 text-lg font-semibold text-indigo-700 transition active:bg-indigo-100 disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          <IconPlus />
                          Tambah
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

          {kbOpen && (
            <VirtualKeyboard
              onChar={(c) => setQuery((v) => v + c)}
              onBackspace={() => setQuery((v) => v.slice(0, -1))}
              onClear={() => setQuery("")}
              onClose={() => setKbOpen(false)}
            />
          )}
        </section>

        {/* Kanan: troli gaya resit */}
        <aside className="flex h-[48%] min-h-0 shrink-0 flex-col border-t border-slate-200/80 bg-white shadow-md lg:h-auto lg:w-[30%] lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between border-b border-dashed border-slate-300 px-5 py-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <IconCart />
              Troli
            </h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-base font-semibold text-slate-600">
              {itemCount} item
            </span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
            {lines.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-slate-400">
                <IconCart width="2.5em" height="2.5em" />
                <p className="text-lg">Ketik produk untuk menambah.</p>
              </div>
            ) : (
              <ul className="divide-y divide-dashed divide-slate-200">
                {lines.map(({ product, qty }) => (
                  <li key={product.id} className="space-y-2 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold leading-snug">{product.name}</p>
                        <p className="text-base text-slate-500">
                          {qty} × {product.priceInCoupons} kupon
                        </p>
                      </div>
                      <p className="text-xl font-bold tabular-nums">
                        {product.priceInCoupons * qty}
                      </p>
                    </div>
                    <Stepper
                      qty={qty}
                      onMinus={() => remove(product)}
                      onPlus={() => add(product)}
                      plusDisabled={qty >= product.stock}
                      label={product.name}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="pb-[max(1rem,env(safe-area-inset-bottom))] shrink-0 space-y-3 border-t border-dashed border-slate-300 bg-slate-50/60 px-5 pt-4">
            {notice && (
              <p className={notice.kind === "ok" ? alertOk : alertErr}>{notice.text}</p>
            )}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 px-5 py-4 text-white shadow-md">
              <p className="text-sm font-medium uppercase tracking-wide text-indigo-100">
                Kupon Perlu Dikutip
              </p>
              <p className="text-5xl font-extrabold tabular-nums leading-tight">{total}</p>
            </div>
            <button
              type="button"
              onClick={confirmSale}
              disabled={lines.length === 0 || pending}
              className="flex min-h-16 w-full touch-manipulation items-center justify-center gap-3 rounded-2xl bg-emerald-600 text-2xl font-extrabold text-white shadow-md transition active:scale-[0.99] active:bg-emerald-800 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
            >
              <IconCheck width="1.2em" height="1.2em" />
              {pending ? "Memproses..." : "Bayar Sekarang"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
