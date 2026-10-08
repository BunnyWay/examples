import type { ComponentProps } from "react";

// Set VITE_BUNNY_OPTIMIZER=true at build time to resize images at the edge with Bunny Optimizer.
const optimizer = import.meta.env.VITE_BUNNY_OPTIMIZER === "true";
const widths = [640, 960, 1280, 1920];

const optimized = (src: string, width: number) => `${src}?width=${width}&quality=75`;

type Props = ComponentProps<"img"> & { src: string; width: number; height: number };

export function BunnyImage({ src, sizes = "100vw", ...props }: Props) {
  if (!optimizer) return <img src={src} {...props} />;

  return (
    <img
      src={optimized(src, 1280)}
      srcSet={widths.map((w) => `${optimized(src, w)} ${w}w`).join(", ")}
      sizes={sizes}
      {...props}
    />
  );
}
