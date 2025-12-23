import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export async function POST(req: NextRequest) {
  const refreshToken = cookies().get("refresh_token")?.value;
  if (!refreshToken)
    return NextResponse.json({ error: "no refresh token" }, { status: 401 });

  const resp = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const data = await resp.json();
  if (!resp.ok) return NextResponse.json(data, { status: resp.status });

  const access = data.access_token;
  const refreshNew = data.refresh_token;
  if (!access || !refreshNew)
    return NextResponse.json(
      { error: "invalid refresh response" },
      { status: 500 }
    );

  cookies().set({
    name: "access_token",
    value: access,
    httpOnly: true,
    path: "/",
    maxAge: 15 * 60,
  });
  cookies().set({
    name: "refresh_token",
    value: refreshNew,
    httpOnly: true,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  // Update user cookie
  try {
    const parts = access.split(".");
    const payload = parts[1];
    const decoded = Buffer.from(payload, "base64").toString("utf8");
    const claims = JSON.parse(decoded);
    const userVal = JSON.stringify({
      user_id: claims?.user_id || null,
      roles: claims?.roles || null,
    });
    cookies().set({
      name: "user",
      value: userVal,
      httpOnly: false,
      path: "/",
      maxAge: 15 * 60,
    });
  } catch (e) {
    // ignore
  }

  return NextResponse.json({ ok: true });
}
