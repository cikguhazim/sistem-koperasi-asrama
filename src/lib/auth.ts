// Dikongsi oleh proxy (edge) dan server actions — guna Web Crypto sahaja.

export const ADMIN_COOKIE = "admin_session";

export function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    // Gagal dengan selamat: tiada kata laluan lalai.
    throw new Error("ADMIN_PASSWORD belum ditetapkan dalam .env");
  }
  return password;
}

// Nilai cookie ialah cincang SHA-256 kata laluan, bukan "true" yang mudah diteka.
export async function adminToken(): Promise<string> {
  const data = new TextEncoder().encode(`koperasi-admin:${getAdminPassword()}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function isValidToken(value: string | undefined): Promise<boolean> {
  return !!value && value === (await adminToken());
}
