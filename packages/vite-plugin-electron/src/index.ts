import { type Plugin, UserConfig } from 'vite';
import { resolveServerUrl } from './utils';
import nodemon = require('nodemon');
export interface ElectronOptions {
  main: {
    entry: string;
    watch?: string[];
  };
}
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
          const electronPath = require('electron');
          const runnerPath = require.resolve('./runner');
          const execArgs = [electronPath, runnerPath, options.main.entry];
          const exec = execArgs.join(' ');
          nodemon.on('error', error => {
            console.log(error);
          });
          nodemon({
            spawn: true,
            exec: exec,
            watch: options?.main?.watch || [],
          });
          nodemon
            .on('start', () => {
              console.log('App has started');
            })
            .on('quit', () => {
              console.log('App has quit');
              process.exit();
            })
            .on('restart', files => {
              console.log('App restarted due to: ', files);
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
