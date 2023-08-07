import { IAliasRegistry, IBeanDefinitionRegistry, IBeanFactory, IObjectBeanDefinition } from '../beans';
import { ModuleStore } from '../decorator/decorators.interface';
import { ResolverFactoryManager } from '../../supports';
import { Identifier, Type } from '../common';
import { ObjectLifeCycle } from '../../enums/enums';
import { IObjectLifecycle } from './object.lifecycle.interface';
import { ICloseable } from './closeable.interface';

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
