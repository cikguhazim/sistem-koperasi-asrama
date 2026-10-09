"use client";

import { useRef, useState, useTransition } from "react";
import { addStock, type ActionResult } from "@/actions/inventory";
import { alertErr, alertOk, btnSuccess, card, input, label } from "@/lib/ui";
import { IconPlus } from "@/components/icons";

export type StockProduct = { id: number; name: string; stock: number };

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
    <form ref={formRef} action={onSubmit} className={`${card} space-y-4 p-6`}>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <IconPlus width="1.4em" height="1.4em" />
        </span>
        <h2 className="text-xl font-bold">Tambah Stok</h2>
      </div>

      {products.length === 0 ? (
        <p className="rounded-xl bg-slate-50 p-4 text-lg text-slate-500">
          Tiada produk lagi. Tambah produk dahulu.
        </p>
      ) : (
        <>
          <label className={label}>
            Produk
            <select name="productId" required defaultValue="" className={input}>
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

          <label className={label}>
            Kuantiti
            <input
              name="quantity"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              required
              placeholder="cth: 20"
              className={input}
            />
          </label>
        </>
      )}

      {result && <p className={result.success ? alertOk : alertErr}>{result.message}</p>}

      <button
        type="submit"
        disabled={pending || products.length === 0}
        className={`${btnSuccess} w-full`}
      >
        <IconPlus />
        {pending ? "Menyimpan..." : "Tambah Stok"}
      </button>
    </form>
  );
}
