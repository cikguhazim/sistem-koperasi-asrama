"use client";

import { useRef, useState, useTransition } from "react";
import { createProduct, type ActionResult } from "@/actions/inventory";
import { alertErr, alertOk, btnPrimary, card, input, label } from "@/lib/ui";
import { IconBox, IconSave } from "@/components/icons";

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
    <form ref={formRef} action={onSubmit} className={`${card} space-y-4 p-6`}>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <IconBox width="1.4em" height="1.4em" />
        </span>
        <h2 className="text-xl font-bold">Tambah Produk Baru</h2>
      </div>

      <label className={label}>
        Nama
        <input name="name" required placeholder="cth: Syampu" className={input} />
      </label>

      <label className={label}>
        Kategori
        <input name="category" required placeholder="cth: Keperluan Harian" className={input} />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className={label}>
          Harga Kupon
          <input
            name="priceInCoupons"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            required
            placeholder="cth: 5"
            className={input}
          />
        </label>
        <label className={label}>
          Stok Awal
          <input
            name="initialStock"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            defaultValue={0}
            required
            className={input}
          />
        </label>
      </div>

      <label className={label}>
        Image URL
        <input name="imageUrl" type="url" placeholder="https://..." className={input} />
        <span className="mt-1.5 block text-sm font-normal text-slate-500">
          Tampal pautan gambar terus di sini
        </span>
      </label>

      {result && <p className={result.success ? alertOk : alertErr}>{result.message}</p>}

      <button type="submit" disabled={pending} className={`${btnPrimary} w-full`}>
        <IconSave />
        {pending ? "Menyimpan..." : "Simpan Produk"}
      </button>
    </form>
  );
}
