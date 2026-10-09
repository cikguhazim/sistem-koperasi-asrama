import { Suspense } from "react";
import { login } from "@/actions/auth";

async function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <form
      action={login}
      className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow"
    >
      <h1 className="text-3xl font-bold">Log Masuk</h1>
      <p className="text-xl text-slate-600">Khas untuk pentadbir koperasi.</p>

      <label className="block space-y-2 text-xl">
        <span>Kata Laluan</span>
        <input
          name="password"
          type="password"
          required
          autoFocus
          className="w-full rounded-xl border-2 border-slate-300 p-4 text-xl focus:border-blue-600 focus:outline-none"
        />
      </label>

      {error && (
        <p className="rounded-xl bg-red-100 p-4 text-xl font-semibold text-red-800">
          Kata laluan salah. Sila cuba lagi.
        </p>
      )}

      <button
        type="submit"
        className="w-full touch-manipulation rounded-2xl bg-blue-600 p-6 text-xl font-bold text-white active:bg-blue-800"
      >
        Log Masuk
      </button>
    </form>
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-slate-900">
      <Suspense fallback={<p className="text-2xl">Memuatkan...</p>}>
        <LoginForm searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
