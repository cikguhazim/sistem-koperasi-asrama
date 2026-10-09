"use client";

import { useState } from "react";
import { input } from "@/lib/ui";
import { IconEye, IconEyeOff } from "@/components/icons";

export default function PasswordField() {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        name="password"
        type={show ? "text" : "password"}
        required
        autoFocus
        autoComplete="current-password"
        placeholder="Masukkan kata laluan"
        className={`${input} pr-14`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Sembunyikan kata laluan" : "Tunjukkan kata laluan"}
        className="absolute right-1.5 top-[0.375rem] mt-[0.375rem] flex h-11 w-11 touch-manipulation items-center justify-center rounded-lg text-slate-500 transition active:bg-slate-100"
      >
        {show ? <IconEyeOff /> : <IconEye />}
      </button>
    </div>
  );
}
