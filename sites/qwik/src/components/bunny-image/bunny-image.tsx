import { component$ } from "@builder.io/qwik";

const enabled = import.meta.env.VITE_BUNNY_OPTIMIZER === "true";
const widths = [640, 960, 1280, 1920];

interface BunnyImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
}

// Bunny Optimizer resizes `?width=` requests at the edge
export const BunnyImage = component$(
  ({ src, alt, width, height, sizes = "100vw" }: BunnyImageProps) => {
    if (!enabled) {
      return <img src={src} alt={alt} width={width} height={height} />;
    }

    const url = (w: number) => `${src}?width=${w}&quality=75`;
    return (
      <img
        src={url(1280)}
        srcset={widths.map((w) => `${url(w)} ${w}w`).join(", ")}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
      />
    );
  },
);
