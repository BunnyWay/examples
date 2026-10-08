import Link from "next/link";

export default function About() {
  return (
    <main>
      <h1>About</h1>
      <p>
        With <code>trailingSlash</code> on, this page builds to <code>about/index.html</code>, so{" "}
        <code>/about/</code> loads straight from storage.
      </p>
      <p>
        <Link href="/">Home</Link>
      </p>
    </main>
  );
}
