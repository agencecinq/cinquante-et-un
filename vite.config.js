
import shopify from 'vite-plugin-shopify'
import tailwindcss from "@tailwindcss/vite";
import pageReload from 'vite-plugin-page-reload'
import { defineConfig } from 'vite'
import viteSvgSpriteWrapper from 'vite-svg-sprite-wrapper';
import clean from '@by-association-only/vite-plugin-shopify-clean'


export default defineConfig({
    plugins: [
        clean(), 
        shopify({
            sourceCodeDir: "src",
            entrypointsDir: "src"
        }),
        tailwindcss(),
        pageReload('/tmp/theme.update', {
            delay: 2000
        }),
        viteSvgSpriteWrapper({
            icons: "src/icons/*.svg",
            outputDir: "assets",
        }),
    ],
    build: {
        emptyOutDir: false,
    },
});