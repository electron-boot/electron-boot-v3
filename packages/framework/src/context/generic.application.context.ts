import { AbstractApplicationContext } from './abstract.application.context';
import { ResolverFactoryManager } from '../supports/resolver.factory.manager';
import { IBeanDefinitionRegistry } from '../interface/beans.interface';
import { IApplicationContext } from '../interface/context.interface';
import { BeanDefinitionRegistry } from '../beans/support/bean.definition.registry';

export class GenericApplicationContext extends AbstractApplicationContext {
  private _registry: IBeanDefinitionRegistry;
  private _resolveFactoryManager: ResolverFactoryManager;
  constructor(parent?: IApplicationContext) {
    super(parent);
    this.registerObject('rootContext', this);
  }

  get registry(): IBeanDefinitionRegistry {
    if (!this._registry) {
      this._registry = new BeanDefinitionRegistry();
    }
    return this._registry;
  }

  set registry(registry: IBeanDefinitionRegistry) {
    this._registry = registry;
  }

  get resolveFactoryManager(): ResolverFactoryManager {
    if (!this._resolveFactoryManager) {
      this._resolveFactoryManager = new ResolverFactoryManager(this);
    }
    return this._resolveFactoryManager;
  }

  set resolveFactoryManager(resolveFactoryManager: ResolverFactoryManager) {
    this._resolveFactoryManager = resolveFactoryManager;
  }

  createChild(): IApplicationContext {
    return new GenericApplicationContext(this);
  }
}
