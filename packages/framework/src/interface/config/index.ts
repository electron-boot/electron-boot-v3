import { LoggerFactoryConfig } from '@electron-boot/logger';
import { Options } from '../support/service/state.interface';
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
   * state config
   */
  state?: Options<Record<string, any>>;
}
