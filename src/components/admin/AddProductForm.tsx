"use client";

import { useRef, useState, useTransition } from "react";
import { createProduct, type ActionResult } from "@/actions/inventory";

const inputClass =
  "w-full rounded-xl border-2 border-slate-300 p-4 text-xl focus:border-blue-600 focus:outline-none";

export default function AddProductForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await createProduct(formData);
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
      <h2 className="text-2xl font-bold">Tambah Produk Baru</h2>

      <label className="block space-y-2 text-xl">
        <span>Nama</span>
        <input name="name" required className={inputClass} />
      </label>

      <label className="block space-y-2 text-xl">
        <span>Kategori</span>
        <input name="category" required className={inputClass} />
      </label>

      <label className="block space-y-2 text-xl">
        <span>Harga Kupon</span>
        <input name="priceInCoupons" type="number" min={1} step={1} required className={inputClass} />
      </label>

      <label className="block space-y-2 text-xl">
        <span>Stok Awal</span>
        <input name="initialStock" type="number" min={0} step={1} defaultValue={0} required className={inputClass} />
      </label>

      <label className="block space-y-2 text-xl">
        <span>Image URL</span>
        <input name="imageUrl" type="url" className={inputClass} />
        <span className="block text-base text-slate-500">
          Tampal pautan gambar terus di sini
        </span>
      </label>

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
        disabled={pending}
        className="w-full touch-manipulation rounded-2xl bg-blue-600 p-6 text-xl font-bold text-white active:bg-blue-800 disabled:bg-slate-300"
      >
        {pending ? "Menyimpan..." : "Simpan Produk"}
      </button>
    </form>
  );
}
