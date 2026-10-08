import { component$ } from "@builder.io/qwik";
import { Link, type DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <>
      <h1>About</h1>
      <p>
        <Link href="/">Home</Link>
      </p>
    </>
  );
});

export const head: DocumentHead = {
  title: "About",
};
