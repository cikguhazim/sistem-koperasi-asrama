"use client";

import { useState, useTransition } from "react";
import { deleteProduct, updateProduct } from "@/actions/manage";
import type { ActionResult } from "@/actions/inventory";

export type ManagedProduct = {
  id: number;
  name: string;
  category: string;
  imageUrl: string | null;
  stock: number;
};

const inputClass =
  "w-full rounded-xl border-2 border-slate-300 p-4 text-xl focus:border-blue-600 focus:outline-none";

function ProductRow({ product }: { product: ManagedProduct }) {
  const [stock, setStock] = useState(String(product.stock));
  const [imageUrl, setImageUrl] = useState(product.imageUrl ?? "");
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  function onUpdate() {
    startTransition(async () => {
      setResult(await updateProduct(product.id, Number(stock), imageUrl));
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
    <div className="space-y-4 rounded-2xl border-2 border-slate-200 p-5">
      <div className="flex items-center gap-4">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-20 w-20 rounded-xl object-cover"
          />
        ) : (
          <div className="h-20 w-20 rounded-xl bg-slate-200" />
        )}
        <div>
          <p className="text-2xl font-bold">{product.name}</p>
          <p className="text-lg text-slate-500">{product.category}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[10rem_1fr]">
        <label className="block space-y-2 text-lg">
          <span>Stok Semasa</span>
          <input
            type="number"
            min={0}
            step={1}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block space-y-2 text-lg">
          <span>URL Gambar</span>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      {result && (
        <p
          className={`rounded-xl p-4 text-lg font-semibold ${
            result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {result.message}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={onUpdate}
          disabled={pending}
          className="touch-manipulation rounded-2xl bg-blue-600 p-6 text-xl font-bold text-white active:bg-blue-800 disabled:bg-slate-300"
        >
          {pending ? "Sila tunggu..." : "Kemaskini"}
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          className="touch-manipulation rounded-2xl bg-red-600 p-6 text-xl font-bold text-white active:bg-red-800 disabled:bg-slate-300"
        >
          Padam
        </button>
      </div>
    </div>
  );
}

export default function ManageProducts({ products }: { products: ManagedProduct[] }) {
  if (products.length === 0) {
    return <p className="text-xl text-slate-500">Tiada produk untuk diurus.</p>;
  }
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {products.map((p) => (
        // key termasuk nilai pelayan supaya borang dimuat semula selepas kemaskini
        <ProductRow key={`${p.id}-${p.stock}-${p.imageUrl ?? ""}`} product={p} />
      ))}
    </div>
  );
}
