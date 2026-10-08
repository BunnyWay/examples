import { splitProps, type JSX } from "solid-js";

const enabled = import.meta.env.VITE_BUNNY_OPTIMIZER === "true";
const widths = [640, 960, 1280, 1920];

type Props = JSX.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
  width: number;
  height: number;
};

// Bunny Optimizer resizes `?width=` requests at the edge
export default function BunnyImage(props: Props) {
  const [local, rest] = splitProps(props, ["src", "sizes"]);
  if (!enabled) return <img src={local.src} {...rest} />;

  const url = (w: number) => `${local.src}?width=${w}&quality=75`;
  return (
    <img
      src={url(1280)}
      srcset={widths.map((w) => `${url(w)} ${w}w`).join(", ")}
      sizes={local.sizes ?? "100vw"}
      {...rest}
    />
  );
}
