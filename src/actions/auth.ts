"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, adminToken, getAdminPassword } from "@/lib/auth";

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (password !== getAdminPassword()) {
    redirect("/login?error=1");
  }

  (await cookies()).set(ADMIN_COOKIE, await adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 30, // 30 minit sahaja
  });
  redirect("/admin");
}

// Tamatkan sesi admin dan kembali ke skrin POS.
export async function logout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/");
}
