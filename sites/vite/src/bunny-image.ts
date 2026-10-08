// Build with VITE_BUNNY_OPTIMIZER=true to let Bunny Optimizer resize images at the edge.
const enabled = import.meta.env.VITE_BUNNY_OPTIMIZER === 'true'
const widths = [640, 960, 1280, 1920]
const url = (src: string, width: number) => `${src}?width=${width}&quality=75`

export function bunnyImage(src: string, alt: string, width: number, height: number, sizes = '100vw') {
  const size = `alt="${alt}" width="${width}" height="${height}"`
  if (!enabled) return `<img src="${src}" ${size}>`

  const srcset = widths.map((w) => `${url(src, w)} ${w}w`).join(', ')
  return `<img src="${url(src, 1280)}" srcset="${srcset}" sizes="${sizes}" ${size}>`
}
