import * as EventEmitter from 'node:events';
import { ResolverFactoryManager } from '../supports/resolver.factory.manager';
import { TypesUtil } from '../utils/types.util';
import { ObjectUtil } from '../utils/object.util';
import { Kind, ObjectLifeCycle, Scope } from '../enums/enums';
import { DecoratorUtil } from '../utils/decorator.util';
import { ArrayUtil } from '../utils/array.util';
import { NotFoundMethodException } from '../errors/exceptions/not.found.method.exception';
import { DefinitionNotFoundException } from '../errors/exceptions/definition.not.found.exception';
import { IAliasRegistry } from '../interface/beans/support/alias.registry';
import { IBeanDefinitionRegistry } from '../interface/beans/support/bean.definition.registry';
import { IObjectBeanDefinition } from '../interface/beans/definition/object.bean.definition';
import { BeanDefinition } from '../interface/beans/definition/bean.definition';
import { IFactoryBeanDefinition } from '../interface/beans/definition/factory.bean.definition';
import { GetOptions } from '../interface/beans/definition/bean.factory';
import { IApplicationContext } from '../interface/context/application.context.interface';
import { Identifier } from '../interface/common';

export abstract class AbstractApplicationContext implements IApplicationContext {
  private readonly _parent: IApplicationContext;
  private _event: EventEmitter = new EventEmitter();
  private moduleMap: Map<Identifier, Set<any>> = null;
  private _aliasRegistry: IAliasRegistry;
  protected ctx = {};
  abstract resolveFactoryManager: ResolverFactoryManager;
  abstract registry: IBeanDefinitionRegistry;

  protected constructor(parent?: IApplicationContext) {
    this._parent = parent;
    this.registerObject(undefined, this);
  }

  saveModule(decorator: Identifier, module: any): void {
    if (!this.moduleMap.has(decorator)) {
      this.moduleMap.set(decorator, new Set());
    }
    this.moduleMap.get(decorator).add(module);
  }
  listModules(decorator: Identifier): any[] {
    return Array.from(this.moduleMap.get(decorator) || []);
  }
  transformModule(moduleMap: Map<Identifier, Set<any>>): void {
    this.moduleMap = new Map(moduleMap);
  }
  get aliasRegistry(): IAliasRegistry {
    if (!this._aliasRegistry) {
      this._aliasRegistry = this.registry.aliasRegistry;
    }
    return this._aliasRegistry;
  }

  get parent(): IApplicationContext {
    return this._parent;
  }

  register<T>(target: T, options?: Partial<IObjectBeanDefinition>): void;
  register<T>(identifier: Identifier, target: T, options?: Partial<IObjectBeanDefinition>): void;
  register(identifier: any, target: any, options?: Partial<IObjectBeanDefinition>): void {
    if (TypesUtil.isClass(identifier)) return this.registerClass(undefined, identifier, target);
    if (TypesUtil.isFunction(identifier)) return this.registerFactory(undefined, identifier, target);
    if (TypesUtil.isClass(target)) return this.registerClass(identifier, target, options);
    if (TypesUtil.isFunction(target)) return this.registerFactory(identifier, target, options);
    return this.registerObject(identifier, target);
  }

  protected registerDefinition(definition: BeanDefinition, options?: Partial<IObjectBeanDefinition>): void {
    if (this.registry.hasDefinition(definition.id)) {
      return;
    }
    if (options) {
      definition = ObjectUtil.extend(true, definition, options);
    }
    if (definition.bindHook) {
      definition.bindHook(definition.target, definition);
    }
    if (definition.kind === Kind.Class) {
      // merge fields
      DecoratorUtil.mergeExtendedFields(definition);
    }
    this.emit(ObjectLifeCycle.BEFORE_BIND, definition.target, {
      context: this,
      definition,
      replaceCallback: newDefinition => {
        definition = newDefinition;
      },
    });
    this.registry.registerDefinition(definition.id, definition);
  }

  registerFactory(identifier: Identifier, target: any, options?: Partial<IObjectBeanDefinition>): void {
    if (TypesUtil.isFunction(target)) {
      if (!identifier && !DecoratorUtil.isFactory(target)) {
        return;
      }
      const beanDefinition = DecoratorUtil.getBeanDefinition<IFactoryBeanDefinition>(target);
      if (identifier) {
        beanDefinition.alias.push(identifier);
      }
      beanDefinition.save();
      return this.registerDefinition(beanDefinition, options);
    }
  }

  registerClass(identifier: Identifier, target: any, options?: Partial<IObjectBeanDefinition>): void {
    if (TypesUtil.isClass(target)) {
      const beanDefinition = DecoratorUtil.getBeanDefinition(target, DecoratorUtil.classBeanDefinition(target));
      if (identifier) {
        beanDefinition.alias.push(identifier);
      }
      beanDefinition.save();
      return this.registerDefinition(beanDefinition, options);
    }
  }

  registerObject(identifier: any, target?: any, replace?: boolean): void {
    if (!TypesUtil.isPlainObject(target) && target.constructor && TypesUtil.isClass(target.constructor)) {
      const definitionTarget = target.constructor;
      const beanDefinition = DecoratorUtil.getBeanDefinition(definitionTarget, DecoratorUtil.classBeanDefinition(definitionTarget));
      if (!DecoratorUtil.isProvider(definitionTarget)) {
        beanDefinition.scope = Scope.Singleton;
      }
      if (identifier && ArrayUtil.contains(beanDefinition.alias, identifier)) {
        beanDefinition.alias.push(identifier);
      }
      beanDefinition.save();
      this.registerDefinition(beanDefinition);
      if (identifier) this.aliasRegistry.setAlias(identifier, beanDefinition.id);
      if (!identifier) identifier = beanDefinition.id;
    }
    if (identifier && (!this.registry.hasObject(identifier) || replace)) {
      this.registry.registerObject(identifier, target);
    }
  }

  abstract createChild(): IApplicationContext;

  ready(): void {}

  async close(): Promise<void> {
    await this.resolveFactoryManager.destroy();
    this.registry.clearAll();
    this.moduleMap = null;
  }

  get<T>(identifier: { new (...args: any[]): T }, args?: any[], options?: GetOptions): T;
  get<T>(identifier: Identifier, args?: any[], options?: GetOptions): T;
  get<T>(identifier: any, args?: any[], options?: GetOptions): T {
    args = args ?? [];
    options = options ?? { originName: identifier };
    if (!TypesUtil.isIdentifier(identifier)) {
      options.originName = identifier?.name;
      identifier = DecoratorUtil.getBeanDefinition(identifier)?.id;
    }
    if (this.registry.hasObject(identifier)) {
      return this.registry.getObject(identifier);
    }
    const definition = this.registry.getDefinition(identifier);
    if (!definition && this.parent) {
      return this.parent.get(identifier, args);
    }
    if (!definition) {
      throw new NotFoundMethodException(options.originName ?? identifier);
    }
    return this.resolveFactoryManager.doCreate(definition, ...args);
  }

  async getAsync<T>(identifier: { new (...args: any[]): T }, args?: any[], options?: GetOptions): Promise<T>;
  async getAsync<T>(identifier: Identifier, args?: any[], options?: GetOptions): Promise<T>;
  async getAsync<T>(identifier: any, args?: any[], options?: GetOptions): Promise<T> {
    args = args ?? [];
    options = options ?? { originName: identifier };
    if (!TypesUtil.isIdentifier(identifier)) {
      options.originName = identifier.name;
      identifier = DecoratorUtil.getBeanDefinition(identifier).id;
    }
    if (this.registry.hasObject(identifier)) {
      return this.registry.getObject(identifier);
    }
    const definition = this.registry.getDefinition(identifier);
    if (!definition && this.parent) {
      return this.parent.get(identifier, args);
    }

    if (!definition) {
      throw new DefinitionNotFoundException(options?.originName ?? identifier);
    }

    return this.resolveFactoryManager.doCreateAsync(definition, ...args);
  }

  // ======================= implement ILifecycle =========================

  onBeforeBind(
    fn: (
      clazz: any,
      options: {
        context: IApplicationContext;
        definition: IObjectBeanDefinition;
        replaceCallback: (newDefinition: IObjectBeanDefinition) => void;
      }
    ) => void
  ): void {
    this._event.on(ObjectLifeCycle.BEFORE_BIND, fn);
  }

  onBeforeObjectCreated(
    fn: (
      Clzz: any,
      options: {
        context: IApplicationContext;
        definition: IObjectBeanDefinition;
        constructorArgs: any[];
      }
    ) => void
  ): void {
    this._event.on(ObjectLifeCycle.BEFORE_CREATED, fn);
  }

  onBeforeObjectDestroy<T>(
    fn: (
      ins: T,
      options: {
        context: IApplicationContext;
        definition: IObjectBeanDefinition;
      }
    ) => void
  ): void {
    this._event.on(ObjectLifeCycle.BEFORE_DESTROY, fn);
  }

  onObjectCreated<T>(
    fn: (
      ins: T,
      options: {
        context: IApplicationContext;
        definition: IObjectBeanDefinition;
        replaceCallback: (ins: T) => void;
      }
    ) => void
  ): void {
    this._event.on(ObjectLifeCycle.AFTER_CREATED, fn);
  }

  onObjectInit<T>(
    fn: (
      ins: T,
      options: {
        context: IApplicationContext;
        definition: IObjectBeanDefinition;
      }
    ) => void
  ): void {
    this._event.on(ObjectLifeCycle.AFTER_INIT, fn);
  }

  emit(name: ObjectLifeCycle, ...args: any[]): void {
    this._event.emit(name, ...args);
  }
}
