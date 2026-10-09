import { Suspense } from "react";
import Link from "next/link";
import { login } from "@/actions/auth";
import PasswordField from "@/components/PasswordField";
import { alertErr, btnPrimary, card, label } from "@/lib/ui";
import Logo from "@/components/Logo";
import { IconArrowLeft } from "@/components/icons";

async function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <form action={login} className={`${card} w-full max-w-md space-y-6 p-8 shadow-md`}>
      <div className="space-y-3 text-center">
        <Logo className="mx-auto h-24" />
        <h1 className="text-3xl font-bold">Log Masuk</h1>
        <p className="text-base text-slate-500">Khas untuk pentadbir koperasi.</p>
      </div>

      <label className={label}>
        Kata Laluan
        <PasswordField />
      </label>

      {error && <p className={alertErr}>Kata laluan salah. Sila cuba lagi.</p>}

      <button type="submit" className={`${btnPrimary} min-h-14 w-full text-xl`}>
        Log Masuk
      </button>

      <Link
        href="/"
        className="flex min-h-11 items-center justify-center gap-2 text-base font-medium text-slate-500 transition active:text-slate-800"
      >
        <IconArrowLeft />
        Kembali ke POS
      </Link>
    </form>
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50 p-6 text-slate-900">
      <Suspense fallback={<p className="text-xl text-slate-400">Memuatkan...</p>}>
        <LoginForm searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
