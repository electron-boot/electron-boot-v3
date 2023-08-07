import { defineConfig } from 'vite';
import electron from '@electron-boot/vite-plugin-electron';
import * as path from 'path';

export default defineConfig({
  plugins: [
    electron({
      main: {
        entry: 'bootstrap.ts',
        watch: [path.resolve('./electron/*')],
      },
    }),
  ],
});
