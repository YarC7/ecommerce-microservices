import { cookies } from "next/headers";
import React from "react";

export default function ProfilePage() {
  const cookieStore = cookies();
  const user = cookieStore.get("user")?.value;
  let userObj = null;
  try {
    userObj = user ? JSON.parse(user) : null;
  } catch {
    userObj = null;
  }

  return (
    <main style={{ maxWidth: 640, margin: "40px auto" }}>
      <h1>Profile</h1>
      {!userObj ? (
        <p>No user info available.</p>
      ) : (
        <div>
          <p>
            <strong>User ID:</strong> {userObj.user_id}
          </p>
          <p>
            <strong>Roles:</strong> {JSON.stringify(userObj.roles)}
          </p>
          <form method="post" action="/api/auth/logout">
            <button type="submit">Logout</button>
          </form>
        </div>
      )}
    </main>
  );
}
