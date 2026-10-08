---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "VitePress on Bunny Storage"
  text: "Static docs on Bunny CDN"
  tagline: Built with VitePress, deployed with bunny sites
  actions:
    - theme: brand
      text: Markdown Examples
      link: /markdown-examples
    - theme: alt
      text: API Examples
      link: /api-examples

features:
  - title: Feature A
    details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
  - title: Feature B
    details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
  - title: Feature C
    details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
---


<script setup>
import BunnyImage from './.vitepress/components/BunnyImage.vue'
</script>

<BunnyImage src="/images/hero.png" alt="A bunny watching a machine turn HTML into Markdown" width="1737" height="893" />
