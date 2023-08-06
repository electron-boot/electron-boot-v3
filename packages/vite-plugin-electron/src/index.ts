import { type Plugin, UserConfig } from 'vite';
import { resolveServerUrl } from './utils';

export default function electron(): Plugin[] {
  const name = '@electron-boot/vite-plugin-electron';
  return [
    {
      name,
      apply: 'serve',
      configureServer(server) {
        server.httpServer?.once('listening', () => {
          Object.assign(process.env, {
            VITE_DEV_SERVER_URL: resolveServerUrl(server),
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

export async function startup(args: string[] = ['.', '--no-sandbox']) {
  const { spawn } = await import('node:child_process');
  const electronPath = require('electron');

  startup.exit();

  // Start Electron.app
  process.electronApp = spawn(electronPath, args, { stdio: 'inherit' });
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
