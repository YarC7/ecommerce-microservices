import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function AdminPage() {
  const user = cookies().get("user")?.value;
  let obj = null;
  try {
    obj = user ? JSON.parse(user) : null;
  } catch (e) {
    obj = null;
  }
  const roles = obj?.roles || null;
  if (!roles || !JSON.stringify(roles).includes("admin")) {
    redirect("/login");
  }

  return (
    <main style={{ maxWidth: 640, margin: "40px auto" }}>
      <h1>Admin</h1>
      <p>Admin-only area.</p>
    </main>
  );
}
