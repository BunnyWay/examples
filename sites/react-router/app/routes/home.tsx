import { Link } from "react-router";
import type { Route } from "./+types/home";
import { BunnyImage } from "../components/BunnyImage";

export function meta({}: Route.MetaArgs) {
  return [{ title: "React Router on Bunny Storage" }];
}

export default function Home() {
  return (
    <main>
      <h1>React Router on Bunny Storage</h1>
      <p>A single-page app built with server rendering turned off.</p>
      <Link to="/about">About</Link>
      <BunnyImage src="/images/hero.png" alt="A bunny watching a machine turn HTML into Markdown" width={1737} height={893} />
    </main>
  );
}
