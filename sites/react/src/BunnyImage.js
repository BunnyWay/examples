// Build with REACT_APP_BUNNY_OPTIMIZER=true to let Bunny Optimizer resize images at the edge.
const enabled = process.env.REACT_APP_BUNNY_OPTIMIZER === 'true';
const widths = [640, 960, 1280, 1920];
const url = (src, width) => `${src}?width=${width}&quality=75`;

export default function BunnyImage({ src, alt, sizes = '100vw', ...props }) {
  if (!enabled) return <img src={src} alt={alt} {...props} />;

  return (
    <img
      src={url(src, 1280)}
      srcSet={widths.map((w) => `${url(src, w)} ${w}w`).join(', ')}
      sizes={sizes}
      alt={alt}
      {...props}
    />
  );
}
