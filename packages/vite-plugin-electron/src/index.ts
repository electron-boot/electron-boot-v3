import { type Plugin, UserConfig } from 'vite';
import { resolveServerUrl } from './utils';
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
          const nodemon = require('nodemon');
          nodemon.on('error', error => {
            console.log(error);
          });
          const opts = {
            scriptPosition: 0,
            spawn: true,
            script: runnerPath,
            exec: electronPath,
            watch: ['./electron/*'],
            args: [options.main.entry],
          };
          nodemon(opts);
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
          server.watcher.add('./electron/*');
          server.watcher.on('change', path => {
            console.log('change…………………………………………………………………………………');
            nodemon.emit('restart', [path]);
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
