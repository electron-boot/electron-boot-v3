import { Type } from './common.interface';
import { DynamicModule } from './metadata.interface';
import { IApplicationContext } from './context.interface';

export interface BootstrapOptions<T = any> {
  /**
   * global config
   */
  globalConfig?: Array<{ [environmentName: string]: Record<string, any> }> | Record<string, any>;
  /**
   * application context
   */
  applicationContext?: IApplicationContext;
  /**
   * preload modules
   */
  preloadModules?: any[];
  /**
   * import extend ayn
   */
  imports?: Array<Type<T> | DynamicModule | Promise<DynamicModule>>;
}
