import { defineConfig } from 'vite';
import electron from '@electron-boot/vite-plugin-electron';

export default defineConfig({
  plugins: [
    electron({
      main: {
        entry: 'electron/bootstrap.ts',
      },
    }),
  ],
});
