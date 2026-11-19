import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
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
