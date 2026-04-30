/** Resolve Audience FastAPI base URL for workflow steps (Node server only). */
export function getApiUrl(): string {
  if (process.env.FASTAPI_URL) {
    return process.env.FASTAPI_URL.replace(/\/$/, "");
  }
  if (process.env.API_URL) {
    return process.env.API_URL.replace(/\/$/, "");
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
