import { component$ } from "@builder.io/qwik";
import { Link, type DocumentHead } from "@builder.io/qwik-city";
import { BunnyImage } from "../components/bunny-image/bunny-image";

export default component$(() => {
  return (
    <>
      <h1>Qwik on Bunny Storage</h1>
      <p>
        <Link href="/about/">About</Link>
      </p>
      <BunnyImage
        src="/images/hero.png"
        alt="A bunny watching a machine turn HTML into Markdown"
        width={1737}
        height={893}
      />
    </>
  );
});

export const head: DocumentHead = {
  title: "Qwik on Bunny Storage",
};
