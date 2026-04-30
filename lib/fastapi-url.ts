/**
 * Base URL workflow steps use for Audience HTTP APIs (`/api/v1/audience-rooms/...`).
 *
 * **This Next project only** — configure env vars on the vectorial Vercel deployment.
 *
 * Precedence:
 * 1. `FASTAPI_URL` or `AUDIENCE_BACKEND_URL` or `API_URL` — explicit backend origin.
 * 2. On Vercel: `https://${VERCEL_URL}` — **same hostname as this app** (see optional rewrite below).
 * 3. Local dev: `http://localhost:8000`.
 *
 * Optional `next.config.ts` rewrite: map `/api/v1/*` on **this** site to another host via
 * `AUDIENCE_BACKEND_REWRITE_TARGET`, so callers and workflows still use one public URL.
 */
export function getApiUrl(): string {
  const explicit =
    process.env.FASTAPI_URL ||
    process.env.AUDIENCE_BACKEND_URL ||
    process.env.API_URL;
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:8000";
}

export function appendEnterpriseQuery(
  url: URL,
  enterpriseName?: string,
): void {
  if (enterpriseName !== undefined && enterpriseName !== "") {
    url.searchParams.set("enterpriseName", enterpriseName);
  }
}
