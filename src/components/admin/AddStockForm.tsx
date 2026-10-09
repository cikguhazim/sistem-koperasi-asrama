"use client";

import { useRef, useState, useTransition } from "react";
import { addStock, type ActionResult } from "@/actions/inventory";

export type StockProduct = { id: number; name: string; stock: number };

const inputClass =
  "w-full rounded-xl border-2 border-slate-300 bg-white p-4 text-xl focus:border-blue-600 focus:outline-none";

export default function AddStockForm({ products }: { products: StockProduct[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await addStock(formData);
      setResult(res);
      if (res.success) formRef.current?.reset();
    });
  }

  return (
    <form
      ref={formRef}
      action={onSubmit}
      className="space-y-5 rounded-2xl bg-white p-6 shadow"
    >
      <h2 className="text-2xl font-bold">Tambah Stok</h2>

      {products.length === 0 ? (
        <p className="text-xl text-slate-500">Tiada produk lagi. Tambah produk dahulu.</p>
      ) : (
        <>
          <label className="block space-y-2 text-xl">
            <span>Produk</span>
            <select name="productId" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                Pilih produk...
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (stok: {p.stock})
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2 text-xl">
            <span>Kuantiti</span>
            <input name="quantity" type="number" min={1} step={1} required className={inputClass} />
          </label>
        </>
      )}

      {result && (
        <p
          className={`rounded-xl p-4 text-xl font-semibold ${
            result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {result.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || products.length === 0}
        className="w-full touch-manipulation rounded-2xl bg-green-600 p-6 text-xl font-bold text-white active:bg-green-800 disabled:bg-slate-300"
      >
        {pending ? "Menyimpan..." : "Tambah Stok"}
      </button>
    </form>
  );
}
