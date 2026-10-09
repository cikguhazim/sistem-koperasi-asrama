"use client";

import { useState, useTransition } from "react";
import { deleteProduct, updateProduct } from "@/actions/manage";
import type { ActionResult } from "@/actions/inventory";
import { alertErr, alertOk, btnDanger, btnPrimary } from "@/lib/ui";
import { IconBox, IconSave, IconTrash } from "@/components/icons";

export type ManagedProduct = {
  id: number;
  name: string;
  category: string;
  imageUrl: string | null;
  priceInCoupons: number;
  stock: number;
};

const softInput =
  "mt-1 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100";
const smallLabel = "block text-xs font-semibold uppercase tracking-wide text-slate-500";

function ProductRow({ product }: { product: ManagedProduct }) {
  const [stock, setStock] = useState(String(product.stock));
  const [price, setPrice] = useState(String(product.priceInCoupons));
  const [imageUrl, setImageUrl] = useState(product.imageUrl ?? "");
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  function onUpdate() {
    startTransition(async () => {
      setResult(await updateProduct(product.id, Number(stock), imageUrl, Number(price)));
    });
  }

  function onDelete() {
    const ok = window.confirm(
      `Padam "${product.name}"? Stok dan semua sejarah transaksinya akan turut dipadam. Tindakan ini tidak boleh dibatalkan.`,
    );
    if (!ok) return;
    startTransition(async () => {
      setResult(await deleteProduct(product.id));
    });
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-16 w-16 shrink-0 rounded-xl object-cover ring-1 ring-slate-200"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-300">
            <IconBox width="1.8em" height="1.8em" />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-xl font-bold">{product.name}</p>
          <span className="mt-1 inline-block rounded-full bg-slate-100 px-3 py-0.5 text-sm font-medium text-slate-600">
            {product.category}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className={smallLabel}>
          Harga Kupon
          <input
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={softInput}
          />
        </label>
        <label className={smallLabel}>
          Stok Semasa
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className={softInput}
          />
        </label>
      </div>
      <label className={smallLabel}>
        URL Gambar
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
          className={softInput}
        />
      </label>

      {result && <p className={result.success ? alertOk : alertErr}>{result.message}</p>}

      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={onUpdate} disabled={pending} className={btnPrimary}>
          <IconSave />
          {pending ? "Sila tunggu..." : "Kemaskini"}
        </button>
        <button type="button" onClick={onDelete} disabled={pending} className={btnDanger}>
          <IconTrash />
          Padam
        </button>
      </div>
    </div>
  );
}

export default function ManageProducts({ products }: { products: ManagedProduct[] }) {
  if (products.length === 0) {
    return (
      <p className="rounded-xl bg-slate-50 p-4 text-lg text-slate-500">
        Tiada produk untuk diurus.
      </p>
    );
  }
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {products.map((p) => (
        // key termasuk nilai pelayan supaya borang dimuat semula selepas kemaskini
        <ProductRow key={`${p.id}-${p.priceInCoupons}-${p.stock}-${p.imageUrl ?? ""}`} product={p} />
      ))}
    </div>
  );
}
