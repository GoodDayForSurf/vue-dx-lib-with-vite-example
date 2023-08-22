import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VueI18nPlugin({
      compositionOnly: false,
    }),
  ],
  resolve: {
    dedupe: ['vue', 'devextreme', 'devextreme-vue'],
    alias: {
      '~@': fileURLToPath(new URL('./src', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
     // 'devextreme/ui': 'devextreme/esm/ui',
    },
  },
  base: '/',
  server: {
    proxy: {
      '^/api|^/odata': {
        target: 'http://localhost:12001/',
        secure: false,
        changeOrigin: true,
      },
    },
  },
  define: {
    APP_VERSION: `${JSON.stringify(process.env.npm_package_version)}`,
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      // treeshake: false,
      cache: false,
    },
  },
});
