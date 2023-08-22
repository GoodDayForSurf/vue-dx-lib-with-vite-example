import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '~@': fileURLToPath(new URL('./src', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // 'devextreme/ui': 'devextreme/esm/ui',
    },
  },
  server: {
    port: 3333,
    proxy: {
      '^/api|^/odata': {
        target: 'http://localhost:12001/',
        secure: false,
        changeOrigin: true,
      },
    },
  },
  plugins: [vue()],
  build: {
    minify: false,
    sourcemap: true,
    target: 'modules',
    outDir: './dist',
    rollupOptions: {
      external: ['vue', 'axios', /devextreme.*/, 'guid-typescript'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
          axios: 'axios',
          'guid-typescript': 'guid-typescript',
        },
      },
    },
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      name: 'dip.toolkit.webui.smarttable',
      fileName: (format) => `index.${format}.js`,
    },
    emptyOutDir: true,
  },
});
