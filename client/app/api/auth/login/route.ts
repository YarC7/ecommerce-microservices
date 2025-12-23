import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type Claims = { user_id?: number | string; roles?: unknown } | null;

function parseJwt(token: string | null): Claims {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = Buffer.from(payload, "base64").toString("utf8");
    return JSON.parse(decoded) as Claims;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password } = body;
  if (!email || !password)
    return NextResponse.json(
      { error: "email and password required" },
      { status: 400 }
    );

  const resp = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await resp.json();
  if (!resp.ok) return NextResponse.json(data, { status: resp.status });

  const access = data.access_token;
  const refresh = data.refresh_token;
  if (!access || !refresh)
    return NextResponse.json(
      { error: "invalid token response" },
      { status: 500 }
    );

  // Set cookies (server-side)
  const cookieStore = await cookies();
  cookieStore.set({
    name: "access_token",
    value: access,
    httpOnly: true,
    path: "/",
    maxAge: 15 * 60,
  });
  cookieStore.set({
    name: "refresh_token",
    value: refresh,
    httpOnly: true,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  // set readable user cookie for client (not httpOnly)
  const claims = parseJwt(access);
  const userVal = JSON.stringify({
    user_id: claims?.user_id || null,
    roles: claims?.roles || null,
  });
  cookieStore.set({
    name: "user",
    value: userVal,
    httpOnly: false,
    path: "/",
    maxAge: 15 * 60,
  });

  // return ok
  return NextResponse.json({ ok: true });
}
