
import shopify from 'vite-plugin-shopify'


export default {
    plugins: [
        shopify({
            sourceCodeDir: "src",
            entrypointsDir: "src/entrypoints"
        }),

    ],
    build: {
        emptyOutDir: false,
    },
};