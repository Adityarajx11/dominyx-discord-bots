import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/wayglim-entry.tsx',
      formats: ['iife'],
      name: 'AurexWayglimBackground',
      fileName: () => 'wayglim-background.js',
    },
    outDir: 'public/assets',
    emptyOutDir: false,
    minify: 'esbuild',
  },
});
