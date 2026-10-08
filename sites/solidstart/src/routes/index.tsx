import BunnyImage from "~/components/BunnyImage";

export default function Home() {
  return (
    <main>
      <h1>SolidStart on Bunny Storage</h1>
      <p><a href="/about">About</a></p>
      <BunnyImage src="/images/hero.png" alt="A bunny watching a machine turn HTML into Markdown" width={1737} height={893} />
    </main>
  );
}
