// Set VITE_BUNNY_OPTIMIZER=true at build time to resize images at the edge with Bunny Optimizer.
const optimizer = import.meta.env.VITE_BUNNY_OPTIMIZER === 'true';
const widths = [640, 960, 1280, 1920];

const optimized = (src, width) => `${src}?width=${width}&quality=75`;
const srcset = (src) =>
  widths.map((w) => `${optimized(src, w)} ${w}w`).join(', ');

<template>
  {{#if optimizer}}
    <img
      src={{optimized @src 1280}}
      srcset={{srcset @src}}
      sizes={{if @sizes @sizes "100vw"}}
      ...attributes
    />
  {{else}}
    <img src={{@src}} ...attributes />
  {{/if}}
</template>
