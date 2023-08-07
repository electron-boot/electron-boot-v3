import { AppInfo, IConfig } from '@electron-boot/framework';

export default (a: AppInfo, b: any): IConfig => {
  console.log(b);
  let urlStr: string;
  if (a.env === 'development') {
    urlStr = process.env.VITE_DEV_SERVER_URL as string;
  } else {
    const url = new URL('file://' + __dirname + '/../../html/index.html');
    urlStr = url.href;
  }
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
        url: urlStr,
        aliasName: 'mainWindow',
        titleBarStyle: 'hidden',
        webPreferences: {
          preload: __dirname + '/./preload.js',
        },
      },
    },
  };
};
