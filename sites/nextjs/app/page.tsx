import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Next.js on Bunny Storage</h1>
      <p>A static export served from Bunny Storage through Bunny CDN.</p>
      <p>
        <Link href="/about/">About</Link>
      </p>
      <Image src="/images/hero.png" alt="A bunny watching a machine turn HTML into Markdown" width={1737} height={893} sizes="100vw" preload />
    </main>
  );
}
