import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';

const url = (src, width) => `${src}?width=${width}&quality=75`;

// A plain <img> by default. With BUNNY_OPTIMIZER=true at build time, each srcset width is a Bunny Optimizer URL.
export default function BunnyImage({src, sizes = '100vw', ...props}) {
  const {siteConfig} = useDocusaurusContext();
  const path = useBaseUrl(src);
  if (!siteConfig.customFields.bunnyOptimizer) {
    return <img src={path} {...props} />;
  }
  const srcSet = [640, 960, 1280, 1920].map((w) => `${url(path, w)} ${w}w`).join(', ');
  return <img src={url(path, 1280)} srcSet={srcSet} sizes={sizes} {...props} />;
}
