import { IApplicationContext } from './application.context.interface';

export interface Context {
  /**
   * Custom properties.
   */
  requestContext: IApplicationContext;
  /**
   * 当前请求开始时间
   */
  startTime: number;
  /**
   * Set value to app attribute map
   * @param key
   * @param value
   */
  setAttr(key: string, value: any);

  /**
   * Get value from app attribute map
   * @param key
   */
  getAttr<T>(key: string): T;
}
