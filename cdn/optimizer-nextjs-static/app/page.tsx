import Image from "next/image";

export default function Home() {
  return (
    <main>
      <h1>Next.js on bunny.net CDN and Optimizer</h1>
      <p>
        A static export on Bunny Storage. Optimizer resizes each image at the edge, so the build
        never touches them.
      </p>

      <h2>Responsive widths</h2>
      <p>
        Next builds a <code>srcset</code>, and Optimizer resizes the image for each{" "}
        <code>?width=</code>.
      </p>
      <Image
        src="/images/hero.png"
        alt="A bunny watching a machine turn HTML into Markdown"
        width={1737}
        height={893}
        sizes="(min-width: 51rem) 48rem, calc(100vw - 3rem)"
        preload
      />

      <h2>Optimizer params on src</h2>
      <p>
        <code>?aspect_ratio=1:1</code> crops to a square, and <code>quality={"{50}"}</code> overrides
        the default.
      </p>
      <div className="grid">
        <Image
          src="/images/optimizer.png?aspect_ratio=1:1"
          alt="Bunny Optimizer illustration cropped to a square"
          width={520}
          height={520}
          sizes="(min-width: 51rem) 23.5rem, calc(50vw - 2rem)"
        />
        <Image
          src="/images/optimizer.png?aspect_ratio=1:1"
          alt="Bunny Optimizer illustration cropped to a square at quality 50"
          width={520}
          height={520}
          sizes="(min-width: 51rem) 23.5rem, calc(50vw - 2rem)"
          quality={50}
        />
      </div>
    </main>
  );
}
