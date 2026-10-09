// Token gaya dikongsi supaya semua skrin nampak seragam.

export const card =
  "rounded-2xl border border-slate-200/80 bg-white shadow-sm";

export const label = "block text-sm font-semibold text-slate-700";

export const input =
  "mt-1.5 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100";

export const btnBase =
  "inline-flex min-h-12 touch-manipulation select-none items-center justify-center gap-2 rounded-xl px-5 py-3 text-lg font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

export const btnPrimary = `${btnBase} bg-indigo-600 text-white shadow-sm active:bg-indigo-800`;
export const btnSuccess = `${btnBase} bg-emerald-600 text-white shadow-sm active:bg-emerald-800`;
export const btnDanger = `${btnBase} bg-rose-600 text-white shadow-sm active:bg-rose-800`;
export const btnDark = `${btnBase} bg-slate-800 text-white shadow-sm active:bg-slate-600`;

export const alertOk =
  "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-base font-semibold text-emerald-800";
export const alertErr =
  "rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-base font-semibold text-rose-800";
