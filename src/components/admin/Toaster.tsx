"use client";

import { useEffect, useState } from "react";

export type ToastDetail = { kind: "ok" | "error"; text: string };

export function showToast(detail: ToastDetail) {
  window.dispatchEvent(new CustomEvent<ToastDetail>("app-toast", { detail }));
}

export default function Toaster() {
  const [toast, setToast] = useState<ToastDetail | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function onToast(e: Event) {
      setToast((e as CustomEvent<ToastDetail>).detail);
      clearTimeout(timer);
      timer = setTimeout(() => setToast(null), 5000);
    }
    window.addEventListener("app-toast", onToast);
    return () => {
      window.removeEventListener("app-toast", onToast);
      clearTimeout(timer);
    };
  }, []);

  if (!toast) return null;
  return (
    <div
      role="status"
      className={`fixed bottom-6 left-1/2 z-50 w-[90%] max-w-xl -translate-x-1/2 rounded-2xl p-5 text-xl font-semibold shadow-lg ${
        toast.kind === "ok" ? "bg-green-600 text-white" : "bg-red-600 text-white"
      }`}
    >
      {toast.text}
    </div>
  );
}
