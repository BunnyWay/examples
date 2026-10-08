import { defineConfig } from 'vite';
import analog from '@analogjs/platform';

export default defineConfig({
  plugins: [
    analog({
      static: true,
      prerender: {
        routes: async () => ['/', '/about'],
      },
    }),
  ],
});
