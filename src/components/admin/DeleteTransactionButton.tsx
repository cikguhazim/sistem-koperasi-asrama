"use client";

import { useTransition } from "react";
import { deleteTransaction } from "@/actions/transaction";
import { showToast } from "@/components/admin/Toaster";

export default function DeleteTransactionButton({ id }: { id: number }) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    const ok = window.confirm(
      "Adakah anda pasti mahu memadam transaksi ini? Jumlah kupon dalam peti wang dan stok akan diselaraskan semula.",
    );
    if (!ok) return;
    startTransition(async () => {
      const res = await deleteTransaction(String(id));
      showToast({ kind: res.success ? "ok" : "error", text: res.message });
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="touch-manipulation rounded-xl bg-red-600 px-5 py-3 text-lg font-bold text-white active:bg-red-800 disabled:bg-slate-300"
    >
      {pending ? "Sila tunggu..." : "Padam"}
    </button>
  );
}
