import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  define: {
    'process.env': process.env
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
