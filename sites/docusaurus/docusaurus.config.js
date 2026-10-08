// @ts-check

/** @type {import('@docusaurus/types').Config} */
export default {
  title: 'Docusaurus on Bunny Storage',
  favicon: 'img/favicon.ico',
  future: {v4: true},

  // Where the site is served. Swap in your own b-cdn.net address or custom domain.
  url: 'https://sites-example-docusaurus-96g41f.b-cdn.net',
  baseUrl: '/',

  onBrokenLinks: 'throw',

  // Set BUNNY_OPTIMIZER=true at build time to serve images through Bunny Optimizer.
  customFields: {
    bunnyOptimizer: process.env.BUNNY_OPTIMIZER === 'true',
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {sidebarPath: './sidebars.js'},
        blog: false,
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Docusaurus on Bunny Storage',
        items: [{type: 'docSidebar', sidebarId: 'docs', position: 'left', label: 'Docs'}],
      },
    }),
};
