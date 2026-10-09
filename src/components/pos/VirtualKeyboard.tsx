"use client";

const ROWS = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

const key =
  "flex h-12 min-w-0 flex-1 touch-manipulation select-none items-center justify-center rounded-xl text-xl font-semibold shadow-sm ring-1 ring-slate-200 transition active:scale-95";
const keyNormal = `${key} bg-white text-slate-800 active:bg-indigo-100`;
const keyAction = `${key} bg-slate-200 text-slate-700 active:bg-slate-300`;

type Props = {
  onChar: (char: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onClose: () => void;
};

export default function VirtualKeyboard({ onChar, onBackspace, onClear, onClose }: Props) {
  // preventDefault pada pointerdown supaya butang tidak mencuri fokus / memilih teks
  const hold = (e: React.PointerEvent) => e.preventDefault();

  return (
    <div
      role="group"
      aria-label="Papan kekunci maya"
      className="shrink-0 space-y-2 border-t border-slate-200 bg-slate-100 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_12px_rgba(15,23,42,0.08)]"
      onPointerDown={hold}
    >
      {ROWS.map((row, i) => (
        <div key={i} className="flex justify-center gap-2">
          {row.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => onChar(k.toLowerCase())}
              className={`${keyNormal} max-w-[4.5rem]`}
            >
              {k}
            </button>
          ))}
          {i === ROWS.length - 1 && (
            <button
              type="button"
              onClick={onBackspace}
              aria-label="Padam huruf terakhir"
              className={`${keyAction} max-w-[6.5rem]`}
            >
              ⌫
            </button>
          )}
        </div>
      ))}

      <div className="flex justify-center gap-2">
        <button type="button" onClick={onClose} className={`${keyAction} max-w-[8rem] text-lg`}>
          Tutup
        </button>
        <button type="button" onClick={() => onChar(" ")} className={`${keyNormal} flex-[4]`}>
          Ruang
        </button>
        <button
          type="button"
          onClick={onClear}
          className={`${key} max-w-[12rem] whitespace-nowrap bg-rose-100 text-lg text-rose-700 active:bg-rose-200`}
        >
          Padam Semua
        </button>
      </div>
    </div>
  );
}
