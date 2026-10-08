import * as React from "react"

const optimizer = process.env.GATSBY_BUNNY_OPTIMIZER === "true"
const widths = [640, 960, 1280, 1920]
const url = (src, width) => `${src}?width=${width}&quality=75`

// A plain <img> by default. With GATSBY_BUNNY_OPTIMIZER=true, each srcset width is a Bunny Optimizer URL.
const BunnyImage = ({ src, alt, sizes = "100vw", ...props }) => {
  if (!optimizer) return <img src={src} alt={alt} {...props} />
  const srcSet = widths.map(w => `${url(src, w)} ${w}w`).join(", ")
  return <img src={url(src, 1280)} srcSet={srcSet} sizes={sizes} alt={alt} {...props} />
}

export default BunnyImage
