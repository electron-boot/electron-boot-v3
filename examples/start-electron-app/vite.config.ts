import { defineConfig } from 'vite';
import electron from '@electron-boot/vite-plugin-electron';
import { rmSync } from 'fs';
import { resolve } from 'path';

rmSync('dist', { recursive: true, force: true }); // v14.14.0

const IsWeb = process.env.BUILD_TARGET === 'web';

const pathResolve = (dir: string): any => {
  return resolve(__dirname, '.', dir);
};

// 渲染项目路径
const renderer = pathResolve('src/renderer');
const alias: Record<string, string> = {
  '/@renderer': renderer,
  '/@store': pathResolve('src/renderer/store'),
};

export default defineConfig({
  root: renderer,
  resolve: {
    alias,
  },
  build: {
    outDir: IsWeb ? resolve('dist/web') : resolve('dist/renderer'),
    emptyOutDir: true,
    target: 'esnext',
    minify: 'esbuild',
  },
  base: './',
  plugins: [electron()],
});
