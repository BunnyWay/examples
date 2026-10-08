<script lang="ts">
// Build with VITE_BUNNY_OPTIMIZER=true to let Bunny Optimizer resize images at the edge.
const enabled = import.meta.env.VITE_BUNNY_OPTIMIZER === 'true'
const widths = [640, 960, 1280, 1920]
const url = (src: string, width: number) => `${src}?width=${width}&quality=75`
</script>

<script setup lang="ts">
const { src, sizes = '100vw' } = defineProps<{ src: string; sizes?: string }>()
</script>

<template>
  <img
    v-if="enabled"
    :src="url(src, 1280)"
    :srcset="widths.map((w) => `${url(src, w)} ${w}w`).join(', ')"
    :sizes="sizes"
  />
  <img v-else :src="src" />
</template>
