import { AllPublishOptions, PublishConfiguration } from 'builder-util-runtime';
export interface AutoUpdate {
  options: PublishConfiguration | AllPublishOptions | string;
  forced?: boolean;
  token?: string;
}

declare module '@electron-boot/framework' {
  interface IConfig {
    autoUpdater?: AutoUpdate;
  }
}
