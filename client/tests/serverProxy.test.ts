import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { forwardRequest } from "../server/lib/serverProxy";

describe("serverProxy.forwardRequest", () => {
  let originalFetch: typeof global.fetch | undefined;

  beforeEach(() => {
    originalFetch = global.fetch;
  });
  afterEach(() => {
    global.fetch = originalFetch;
    vi.resetAllMocks();
  });

  it("retries after 401 by calling refresh and then retrying", async () => {
    const calls: Array<{ url: string; opts: unknown }> = [];
    global.fetch = vi.fn(async (url: string, opts?: unknown) => {
      calls.push({ url, opts });
      if (url.endsWith("/api/v1/auth/refresh")) {
        // refresh endpoint called
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      // first attempt to target returns 401, second returns 200
      if (!calls.find((c) => c.url === "https://api/second")) {
        return new Response("unauth", { status: 401 });
      }
      return new Response(JSON.stringify({ hello: "world" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as unknown as typeof global.fetch;

    const resp = await forwardRequest({
      method: "GET",
      url: "https://api/second",
      accessToken: "t",
      refreshToken: "rt",
    });
    const text = await resp.text();
    expect(resp.status).toBe(200);
    expect(JSON.parse(text)).toEqual({ hello: "world" });
    // ensure refresh was called
    // ensure refresh was called by inspecting our recorded calls
    expect(
      calls.some((c) => (c.url as string).endsWith("/api/v1/auth/refresh"))
    ).toBe(true);
  });
});
