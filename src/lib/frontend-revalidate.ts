/**
 * src/lib/frontend-revalidate.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Helper untuk mem-trigger ISR cache revalidation pada frontend.
 *
 * Setelah setiap content mutation di CRM, helper ini memanggil
 * frontend's /api/revalidate endpoint untuk menghapus cache halaman
 * yang terpengaruh.
 *
 * Non-blocking (fire-and-forget): error ditangkap dan di-log,
 * tidak pernah throw agar tidak mengganggu flow Server Action.
 *
 * Env vars:
 *   FRONTEND_URL       — base URL frontend (default: http://localhost:3000)
 *   REVALIDATE_SECRET  — shared secret, harus sama dengan frontend
 */

const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

let warnOnce = false;

/**
 * Trigger ISR revalidation pada frontend untuk path-path tertentu.
 * Fire-and-forget: mengembalikan Promise tapi tidak perlu di-await.
 */
export function triggerFrontendRevalidation(paths: string[]): void {
  // Jangan block — jalankan di background
  void doRevalidate(paths);
}

async function doRevalidate(paths: string[]): Promise<void> {
  if (!REVALIDATE_SECRET) {
    if (!warnOnce) {
      console.warn(
        "[frontend-revalidate] REVALIDATE_SECRET tidak diset. " +
          "Frontend ISR revalidation dinonaktifkan."
      );
      warnOnce = true;
    }
    return;
  }

  if (!paths || paths.length === 0) return;

  try {
    const response = await fetch(`${FRONTEND_URL}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${REVALIDATE_SECRET}`,
      },
      body: JSON.stringify({
        paths,
        source: "mrs-backend-v1",
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "unknown error");
      console.error(
        `[frontend-revalidate] Gagal revalidate paths ${JSON.stringify(paths)}: ${response.status} ${text}`
      );
    }
  } catch (error) {
    console.error(
      `[frontend-revalidate] Error saat revalidate paths ${JSON.stringify(paths)}:`,
      error
    );
  }
}

/**
 * Mapping collection name ke frontend paths yang harus di-revalidate.
 * Digunakan oleh Server Actions setelah setiap mutation.
 */
export const REVALIDATION_PATHS: Record<string, string[]> = {
  posts: ["/berita", "/"],
  projects: ["/proyek", "/"],
  products: ["/produk", "/"],
  "product-categories": ["/produk", "/"],
  testimonials: ["/"],
  team: ["/tentang-kami", "/"],
  certifications: ["/tentang-kami", "/"],
  industries: ["/layanan", "/"],
  innovations: ["/layanan", "/"],
  pages: ["/"],
  globals: ["/"],
  media: ["/"],
};
