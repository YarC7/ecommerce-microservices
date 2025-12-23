import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { forwardRequest } from "../../server/lib/serverProxy";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export async function POST(req: NextRequest) {
  const { method, path, headers, body } = await req.json();
  const cookieStore = await cookies();
  const access = cookieStore.get("access_token")?.value ?? null;
  const refresh = cookieStore.get("refresh_token")?.value ?? null;

  // forward request; will attempt refresh internally on 401 using refresh token
  const url = API_BASE + path;
  const resp = await forwardRequest({
    method,
    url,
    body,
    headers,
    accessToken: access,
    refreshToken: refresh,
  });

  const data = await resp.text();
  const res = new NextResponse(data, { status: resp.status });

  // copy response headers (some may be unsafe; copy common ones)
  resp.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") return; // avoid leaking
    res.headers.set(key, value);
  });

  return res;
}
