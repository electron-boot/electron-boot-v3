import { Identifier } from './common.interface';

/**
 * 路由信息
 */
export interface RouterInfo {
  /**
   * uuid
   */
  id?: string;
  /**
   * 控制器前缀
   */
  prefix?: string;
  /**
   * 路由名称
   */
  routerName?: string;
  /**
   * 路由路径
   */
  url: string;
  /**
   * 调用的函数方法
   */
  method: string | ((...args: any[]) => void);
  /**
   * 路由处理程序键，用于ioc容器加载
   */
  handlerName?: string;
  /**
   *
   */
  funcHandlerName?: string;
  /**
   * controller的provideId
   */
  controllerId?: Identifier;
  /**
   * 方法名
   */
  functionName?: string;
  /**
   * 服务方法触发器元数据
   */
  functionTriggerMetadata?: any;
  /**
   * 服务方法元数据
   */
  functionMetadata?: any;
}
export interface RouterPriority {
  prefix: string;
  priority: number;
  middleware: any[];
  routerOptions: any;
  controllerId: string;
  /**
   * 路由控制器或者函数 module 本身
   */
  routerModule: any;
}

export type DynamicRouterInfo = Omit<RouterInfo, 'id' | 'url' | 'prefix' | 'method' | 'controllerId' | 'responseMetadata'>;
