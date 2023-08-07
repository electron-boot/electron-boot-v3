import { Identifier } from '../../common';

export interface GetOptions {
  originName?: string;
}
export interface IBeanFactory {
  get<T>(identifier: { new (...args: any[]): T }, args?: any[], objectContext?: GetOptions): T;
  get<T>(identifier: Identifier, args?: any[], objectContext?: GetOptions): T;
  getAsync<T>(identifier: { new (...args: any[]): T }, args?: any[], objectContext?: GetOptions): Promise<T>;
  getAsync<T>(identifier: Identifier, args?: any[], objectContext?: GetOptions): Promise<T>;
}
