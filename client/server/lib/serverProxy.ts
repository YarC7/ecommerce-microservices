export type ForwardOptions = {
  method?: string;
  url: string;
  body?: unknown;
  headers?: Record<string, string>;
  accessToken?: string | null;
  refreshToken?: string | null;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export async function forwardRequest(opts: ForwardOptions): Promise<Response> {
  const method = (opts.method || "GET").toUpperCase();
  const headers: Record<string, string> = Object.assign({}, opts.headers || {});
  if (opts.accessToken) {
    headers["Authorization"] = `Bearer ${opts.accessToken}`;
  }
  headers["Accept"] = headers["Accept"] || "application/json";

  const body = opts.body
    ? typeof opts.body === "string"
      ? opts.body
      : JSON.stringify(opts.body)
    : undefined;

  const resp = await fetch(opts.url, { method, headers, body });
  if (resp.status === 401) {
    // Try to refresh using provided refreshToken if available
    try {
      if (opts.refreshToken) {
        const r = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: opts.refreshToken }),
        });
        if (r.ok) {
          // After refresh succeeded, retry the original request with same headers
          const retryResp = await fetch(opts.url, { method, headers, body });
          return retryResp;
        }
      }
    } catch {
      // ignore and fallthrough
    }
  }

  return resp;
}
