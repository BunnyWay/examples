const optimizer = process.env.BUNNY_OPTIMIZER === "true";
const url = (src, width) => `${src}?width=${width}&quality=75`;

export default function (eleventyConfig) {
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.addPassthroughCopy("images");

  // A plain <img> by default. With BUNNY_OPTIMIZER=true, each srcset width is a Bunny Optimizer URL.
  eleventyConfig.addShortcode("bunnyImage", (src, alt, width, height, sizes = "100vw") => {
    const attrs = `alt="${alt}" width="${width}" height="${height}"`;
    if (!optimizer) return `<img src="${src}" ${attrs}>`;
    const srcset = [640, 960, 1280, 1920].map((w) => `${url(src, w)} ${w}w`).join(", ");
    return `<img src="${url(src, 1280)}" srcset="${srcset}" sizes="${sizes}" ${attrs}>`;
  });
}
