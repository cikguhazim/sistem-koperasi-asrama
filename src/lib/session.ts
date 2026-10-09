import { cookies } from "next/headers";
import { ADMIN_COOKIE, isValidToken } from "@/lib/auth";

export async function isAdmin(): Promise<boolean> {
  return isValidToken((await cookies()).get(ADMIN_COOKIE)?.value);
}
