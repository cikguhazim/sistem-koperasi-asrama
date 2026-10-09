"use client";

import { useTransition } from "react";
import { deleteTransaction } from "@/actions/transaction";
import { showToast } from "@/components/admin/Toaster";
import { IconTrash } from "@/components/icons";

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
      aria-label={`Padam transaksi ${id}`}
      title="Padam"
      className="inline-flex h-11 w-11 touch-manipulation items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-200 transition active:scale-95 active:bg-rose-100 disabled:opacity-50"
    >
      <IconTrash />
    </button>
  );
}
