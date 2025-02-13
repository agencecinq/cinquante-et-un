import { defineConfig } from 'vite';
import shopify from 'vite-plugin-shopify';
import tailwindcss from '@tailwindcss/vite';
import viteSvgSpriteWrapper from 'vite-svg-sprite-wrapper';
import clean from '@by-association-only/vite-plugin-shopify-clean';

export default defineConfig({
  plugins: [
    clean(),
    shopify({
      sourceCodeDir: 'src',
      entrypointsDir: 'src',
    }),
    tailwindcss(),
    viteSvgSpriteWrapper({
      icons: 'src/icons/*.svg',
      outputDir: 'assets',
    }),
  ],
  build: {
    emptyOutDir: false,
  },
});
