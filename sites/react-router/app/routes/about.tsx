import { Link } from "react-router";
import type { Route } from "./+types/about";

export function meta({}: Route.MetaArgs) {
  return [{ title: "About | React Router on Bunny Storage" }];
}

export default function About() {
  return (
    <main>
      <h1>About</h1>
      <p>Open this page directly to check that the site serves index.html for client-side routes.</p>
      <Link to="/">Home</Link>
    </main>
  );
}
