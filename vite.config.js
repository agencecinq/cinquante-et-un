import { defineConfig } from 'vite';
import shopify from 'vite-plugin-shopify';
import tailwindcss from '@tailwindcss/vite';
import viteSvgSpriteWrapper from 'vite-svg-sprite-wrapper';
import clean from '@by-association-only/vite-plugin-shopify-clean';
import { cinqDrawerPlugin } from '@agencecinq/drawer/plugin';

export default defineConfig({
  publicDir: 'public',
  plugins: [
    cinqDrawerPlugin(),
    clean(),
    shopify({
      sourceCodeDir: 'src',
      entrypointsDir: 'src',
      additionalEntrypoints: ['scripts/app.ts', 'stylesheets/styles.css'],
    }),
    tailwindcss(),
    viteSvgSpriteWrapper({
      icons: 'src/icons/*.svg',
      outputDir: 'assets/',
      sprite: {
        // Use the transform option to prefix all IDs in the SVG content
        svg: {
          transform: (svg) => {
            // Prefix all id="..." and xlink:href="#..." and url(#...) occurrences
            const prefix = 'icon-';
            return svg
              .replace(/id="([^"]+)"/g, (match, p1) => `id="${prefix}${p1}"`)
              .replace(/xlink:href="#([^"]+)"/g, (match, p1) => `xlink:href="#${prefix}${p1}"`)
              .replace(/url\(#([^)]+)\)/g, (match, p1) => `url(#${prefix}${p1})`);
          },
        },
      },
    }),
  ],
  build: {
    emptyOutDir: false,
  },
  server: {
    cors: {
      origin: [
        /^https?:\/\/(?:(?:[^:]+\.)?localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/,
        // Add your storefront URL for Vite HMR CORS, e.g.:
        // 'https://your-store.myshopify.com',
      ],
    },
  },
});
