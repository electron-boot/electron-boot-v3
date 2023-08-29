import { Init, Singleton } from '@electron-boot/framework';
import { Config } from '@electron-boot/framework/src';

export interface IWindowCreationOptions {
  width?: number;
  height?: number;
}
declare module '@electron-boot/framework' {
  export interface IConfig {
    mainWindow: IWindowCreationOptions;
  }
}

@Singleton()
export default class MainWindow {
  @Config('mainWindow')
  config: IWindowCreationOptions;
  @Init()
  init() {}
}
