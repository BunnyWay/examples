import Link from "next/link";
import { cookies } from "next/headers";

async function save(formData: FormData) {
  "use server";
  (await cookies()).set("name", String(formData.get("name")), { httpOnly: true, sameSite: "lax" });
}

export default async function CookiePage() {
  const name = (await cookies()).get("name")?.value;

  return (
    <main>
      <h1>Cookies and Server Actions</h1>
      <p>
        A whole-site pull zone needs <code>allowedOrigins</code> for this form to submit, and must
        not strip <code>Set-Cookie</code> for the name to survive a reload.
      </p>
      <p>Saved name: {name ? <code>{name}</code> : "none"}</p>
      <form action={save}>
        <input name="name" defaultValue={name} required />
        <button type="submit">Save</button>
      </form>
      <p>
        <Link href="/">Back to images</Link>
      </p>
    </main>
  );
}
