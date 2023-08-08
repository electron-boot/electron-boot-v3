import { type Plugin, UserConfig, WatchOptions } from 'vite';
import { resolveServerUrl } from './utils';
import { spawn } from 'child_process';
const chokidar = require('chokidar');
const electronPath = require('electron');
import path from 'path';
export interface ElectronOptions {
  main: {
    entry: string;
    watch?: WatchOptions;
  };
}
const defaultWatchOptions = {
  ignored: ['**/.git/**', '**/node_modules/**'],
  ignoreInitial: true,
  ignorePermissionErrors: true,
  disableGlobbing: true,
  persistent: true,
  interval: 100,
  binaryInterval: 300,
  enableBinaryInterval: true,
  useFsEvents: true,
  atomic: false,
  followSymlinks: true,
  awaitWriteFinish: false,
};
export default function electron(options: ElectronOptions): Plugin[] {
  const name = '@electron-boot/vite-plugin-electron';
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
          const watchDir = path.resolve(process.cwd(), path.dirname(options.main.entry));
          const watchOptions = Object.assign({}, defaultWatchOptions, options.main.watch);
          const runnerPath = require.resolve('./runner');
          const startup = createStartup([runnerPath, options.main.entry]);
          startup();
          chokidar.watch(watchDir, watchOptions).on('change', () => {
            startup();
          });
        });
      },
    },
    {
      name,
      apply: 'build',
      config(config: UserConfig, env) {
        console.log(config, env);
      },
    },
  ];
}

export const createStartup = (argv: string[]): (() => void) => {
  return () => startup(argv);
};
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
