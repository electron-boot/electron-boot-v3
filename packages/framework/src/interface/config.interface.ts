import { LoggerFactoryConfig } from '@electron-boot/logger';
import { BrowserWindowOptions } from './client.interface';
export type PowerPartial<T> = {
  [U in keyof T]?: T[U] extends {} ? PowerPartial<T[U]> : T[U];
};
export type ServiceFactoryConfigOption<OPTIONS> = {
  default: PowerPartial<OPTIONS>;
  [key: string]: PowerPartial<OPTIONS>;
};
export interface IConfig {
  /**
   * The logger config
   */
  logger?: LoggerFactoryConfig;
  /**
   * The window options
   */
  windowsOptions?: ServiceFactoryConfigOption<BrowserWindowOptions>;
}
