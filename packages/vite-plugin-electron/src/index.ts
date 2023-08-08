import { type Plugin } from 'vite';
import { TscWatchClient } from 'tsc-watch/client';
import { resolveServerUrl } from './utils';
import { spawn } from 'child_process';
import * as fs from 'fs';
const electronPath = require('electron');
export interface ElectronOptions {
  project?: string;
  compiler?: string;
}
const watcher = new TscWatchClient();
export default function electron(options: ElectronOptions = {}): Plugin[] {
  const name = '@electron-boot/vite-plugin-electron';
  const tsconfigPath = options?.project ?? 'tsconfig.electron.json';
  if (!fs.existsSync(tsconfigPath)) {
    throw new Error(`tsconfig.electron.json not found in ${tsconfigPath}`);
  }
  const args = ['--project', tsconfigPath];
  if (!options.compiler) {
    options.compiler = 'typescript/bin/tsc';
  }
  args.push('--compiler', options.compiler);
  return [
    {
      name,
      apply: 'serve',
      configureServer(server) {
        // 调试模式
        server.httpServer?.once('listening', () => {
          Object.assign(process.env, {
            VITE_DEV_SERVER_URL: resolveServerUrl(server),
          });
          watcher.on('success', async () => {
            await startup();
          });
          watcher.start(...args);
        });
      },
    },
    {
      name,
      apply: 'build',
      async closeBundle() {
        watcher.on('first_success', () => {
          watcher.kill();
        });
        watcher.start(...args);
      },
    },
  ];
}
export async function startup(argv = ['.', '--no-sandbox']) {
  startup.exit();
  // Start Electron.app
  process.electronApp = spawn(electronPath, argv, { stdio: 'inherit' });
  // Exit command after Electron.app exits
  process.electronApp.once('exit', process.exit);

  if (!startup.hookProcessExit) {
    startup.hookProcessExit = true;
    process.once('exit', startup.exit);
  }
}
startup.hookProcessExit = false;
startup.exit = () => {
  if (process.electronApp) {
    process.electronApp.removeAllListeners();
    process.electronApp.kill();
  }
};
