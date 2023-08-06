import { IAliasRegistry, IBeanDefinitionRegistry, IBeanFactory, IObjectBeanDefinition } from './beans.interface';
import { Identifier, Type } from './common.interface';
import { ResolverFactoryManager } from '../supports/resolver.factory.manager';
import { ObjectLifeCycle } from '../enums/enums';
import { ModuleStore } from './decorators.interface';

export interface ICloseable {
  close(): void;
}

export interface IObjectLifecycle {
  onBeforeBind(
    fn: (
      clazz: any,
      options: {
        context: IApplicationContext;
        definition: IObjectBeanDefinition;
        replaceCallback: (newDefinition: IObjectBeanDefinition) => void;
      }
    ) => void
  ): void;
  onBeforeObjectCreated(
    fn: (
      Clzz: any,
      options: {
        context: IApplicationContext;
        definition: IObjectBeanDefinition;
        constructorArgs: any[];
      }
    ) => void
  ): void;
  onObjectCreated<T>(
    fn: (
      ins: T,
      options: {
        context: IApplicationContext;
        definition: IObjectBeanDefinition;
        replaceCallback: (ins: T) => void;
      }
    ) => void
  ): void;
  onObjectInit<T>(
    fn: (
      ins: T,
      options: {
        context: IApplicationContext;
        definition: IObjectBeanDefinition;
      }
    ) => void
  ): void;
  onBeforeObjectDestroy<T>(
    fn: (
      ins: T,
      options: {
        context: IApplicationContext;
        definition: IObjectBeanDefinition;
      }
    ) => void
  ): void;
}

export interface ModuleLifecycle {
  onConfigLoad?(applicationContext?: IApplicationContext): Promise<any> | any;
  onReady?(applicationContext?: IApplicationContext): Promise<void> | void;
  onStop?(applicationContext?: IApplicationContext): Promise<void> | void;
  onSocketReady?(applicationContext?: IApplicationContext): Promise<void> | void;
}

export interface ILifecycle extends IObjectLifecycle, ModuleLifecycle {}

export interface IApplicationContext extends IObjectLifecycle, ICloseable, IBeanFactory, ModuleStore {
  readonly parent: IApplicationContext;
  registry: IBeanDefinitionRegistry;
  resolveFactoryManager: ResolverFactoryManager;
  readonly aliasRegistry: IAliasRegistry;
  register<T>(target: T, options?: Partial<IObjectBeanDefinition>): void;
  register<T>(identifier: Identifier, target: T): void;
  registerClass(identifier: Identifier, target: Type, options?: Partial<IObjectBeanDefinition>): void;
  registerFactory(identifier: Identifier, target: any, options?: Partial<IObjectBeanDefinition>): void;
  registerObject(identifier: Identifier, target: any): void;
  createChild(): IApplicationContext;
  ready(): void;
  emit(name: ObjectLifeCycle, ...args: any[]): void;
}

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
