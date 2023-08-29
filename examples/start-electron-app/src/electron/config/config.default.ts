import { AppInfo, IConfig } from '@electron-boot/framework';

export default (appInfo: AppInfo): IConfig => {
  let urlStr: string;
  if (appInfo.env === 'development') {
    urlStr = process.env.VITE_DEV_SERVER_URL as string;
  } else {
    const url = new URL('file://' + __dirname + '/../../html/index.html');
    urlStr = url.href;
  }
  return {
    autoUpdater: {
      options: 'http://www.baidu.com',
    },
    mainWindow: {},
  } as IConfig;
};
