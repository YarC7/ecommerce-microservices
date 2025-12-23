type ApiOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
};

export async function apiFetch(path: string, opts: ApiOptions = {}) {
  // forward via server-side proxy so the server can attach httpOnly cookies
  const resp = await fetch("/api/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      method: opts.method || "GET",
      path,
      headers: opts.headers || {},
      body: opts.body,
    }),
  });

  if (resp.status === 401) {
    // try refresh
    const r = await fetch("/api/auth/refresh", { method: "POST" });
    if (r.ok) {
      // retry
      return apiFetch(path, opts);
    }
  }

  const text = await resp.text();
  const contentType = resp.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return JSON.parse(text);
  return text;
}
