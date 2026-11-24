import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@shell-drone/firework-engine': fs.existsSync(path.resolve(__dirname, '../firework-engine/src/index.js'))
        ? path.resolve(__dirname, '../firework-engine/src/index.js')
        : '@shell-drone/firework-engine'
    },
    dedupe: ['three']
  },
  server: {
    fs: {
      allow: ['..']
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  }
});
