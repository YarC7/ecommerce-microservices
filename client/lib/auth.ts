export async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
  // reload to reflect logged-out state
  window.location.href = "/";
}

export async function refresh() {
  const resp = await fetch("/api/auth/refresh", { method: "POST" });
  return resp.ok;
}
