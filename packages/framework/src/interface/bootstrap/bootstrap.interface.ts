import { Type } from '../common';
import { DynamicModule } from '../decorator/metadata.interface';
import { IApplicationContext } from '../context/application.context.interface';

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
