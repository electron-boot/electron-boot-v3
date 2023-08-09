import { IConfig } from '../../../src';

export const AppConfig = (): IConfig => {
  const url = new URL('file://' + __dirname + '/../../html/index.html');
  return {
    windowsOptions: {
      default: {
        show: false,
        titleBarStyle: 'default',
        focusable: true,
        center: true,
        webPreferences: {
          contextIsolation: true,
          scrollBounce: process.platform === 'darwin',
        },
      },
      main: {
        show: false,
        url: url.href,
        titleBarStyle: 'hidden',
        webPreferences: {
          preload: __dirname + '/./preload.js',
        },
      },
    },
  };
};
