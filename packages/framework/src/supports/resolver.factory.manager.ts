import { ResolveFactory, ResolveOptions } from '../interface/support/support.interface';
import { InjectMode, Kind, ObjectLifeCycle } from '../enums/enums';
import { MissingImportException } from '../errors/exceptions/missing.import.exception';
import { DefinitionNotFoundException } from '../errors/exceptions/definition.not.found.exception';
import { ResolverMissingException } from '../errors/exceptions/resolver.missing.exception';
import { SingletonInjectRequestException } from '../errors/exceptions/singleton.inject.request.exception';
import { DecoratorName } from '../utils/decorator.util';
import { AutowiredFieldMetadata } from '../interface/decorator/metadata.interface';
import { BeanDefinition } from '../interface/beans/definition/bean.definition';
import { IFieldDefinition } from '../interface/beans/definition/field.definition';
import { IObjectBeanDefinition } from '../interface/beans/definition/object.bean.definition';
import { IApplicationContext } from '../interface/context/application.context.interface';
import { Identifier } from '../interface/common';
export class RefResolver implements ResolveFactory {
  static NAME = 'ref';
  readonly factory: ResolverFactoryManager;
  constructor(factory: ResolverFactoryManager) {
    this.factory = factory;
  }
  getName(): string {
    return RefResolver.NAME;
  }

  resolve(options: ResolveOptions, originName: string): any {
    if (options.injectMode === InjectMode.Class && !(this.factory.context.parent ?? this.factory.context).registry.hasDefinition(options.provider)) {
      throw new MissingImportException(originName);
    }
    return this.factory.context.get(options.provider, undefined, {
      originName,
    });
  }

  resolveAsync(options: ResolveOptions, originName: string): Promise<any> {
    if (options.injectMode === InjectMode.Class && !(this.factory.context.parent ?? this.factory.context).registry.hasDefinition(options.name)) {
      throw new MissingImportException(originName);
    }
    return this.factory.context.getAsync(options.provider, undefined, {
      originName,
    });
  }
}
export class ResolverFactoryManager {
  private resolvers: Map<string, ResolveFactory> = new Map<string, ResolveFactory>();
  private singletonCache = new Map<Identifier, any>();
  private creating = new Map<Identifier, boolean>();
  readonly context: IApplicationContext;
  constructor(context: IApplicationContext) {
    this.context = context;
    this.resolvers.set(RefResolver.NAME, new RefResolver(this));
  }

  doCreate(definition: BeanDefinition, ...args: any[]): any {
    if (definition.isSingletonScope() && this.singletonCache.has(definition.id)) {
      return this.singletonCache.get(definition.id);
    }
    let instance = this.createProxy(definition);
    if (instance) {
      return instance;
    }
    this.compareAndSetCreateStatus(definition);

    const clazz = definition.creator.load();

    const constructorParameters = this.getConstructorParameters(definition, ...args);

    this.context.emit(ObjectLifeCycle.BEFORE_CREATED, clazz, {
      constructorArgs: constructorParameters,
      definition,
      context: this.context,
    });

    instance = definition.creator.doConstruct(clazz, constructorParameters);

    if (definition.kind === Kind.Class && definition.fields) {
      const keys = definition.fields.fieldKeys() as string[];
      for (const key of keys) {
        const fieldInfo = definition.fields.getField(key);
        if (fieldInfo.decorator !== DecoratorName.AUTOWIRED) continue;
        this.checkSingletonInvokeRequest(definition, key);
        try {
          const metadata: AutowiredFieldMetadata = fieldInfo.metadata;
          const options: ResolveOptions = {
            type: metadata.type ?? RefResolver.NAME,
            injectMode: metadata.injectMode,
            provider: metadata.provider,
          };
          instance[key] = this.resolve(options, key);
        } catch (error) {
          if (DefinitionNotFoundException.isClosePrototypeOf(error)) {
            const className = definition.target.name;
            error.updateErrorMsg(className);
          }
          this.removeCreateStatus(definition, true);
          throw error;
        }
      }
    }

    this.context.emit(ObjectLifeCycle.AFTER_CREATED, instance, {
      context: this.context,
      definition,
      replaceCallback: (ins: any) => {
        instance = ins;
      },
    });

    definition.creator.doInit(instance);

    this.context.emit(ObjectLifeCycle.AFTER_INIT, instance, {
      context: this.context,
      definition,
    });

    if (definition.isSingletonScope() && definition.id) {
      this.singletonCache.set(definition.id, instance);
    }

    if (definition.isRequestScope() && definition.id) {
      this.context.registerObject(definition.id, instance);
    }
    this.removeCreateStatus(definition, true);

    return instance;
  }

  async doCreateAsync(definition: BeanDefinition, ...args: any[]): Promise<any> {
    if (definition.isSingletonScope() && this.singletonCache.has(definition.id)) {
      return this.singletonCache.get(definition.id);
    }
    let instance: any = this.createProxy(definition);
    if (instance) {
      return instance;
    }
    this.compareAndSetCreateStatus(definition);

    const clazz = definition.creator.load();

    const constructorParameters = this.getConstructorParameters(definition, ...args);

    this.context.emit(ObjectLifeCycle.BEFORE_CREATED, clazz, {
      constructorArgs: constructorParameters,
      definition,
      context: this.context,
    });

    instance = await definition.creator.doConstructAsync(clazz, constructorParameters);

    if (definition.kind === Kind.Class && definition.fields) {
      const keys = definition.fields.fieldKeys() as string[];
      for (const key of keys) {
        const fieldInfo = definition.fields.getField(key);
        if (fieldInfo.decorator !== DecoratorName.AUTOWIRED) continue;
        this.checkSingletonInvokeRequest(definition, key);
        try {
          const metadata: AutowiredFieldMetadata = fieldInfo.metadata;
          const options: ResolveOptions = {
            type: metadata.type ?? RefResolver.NAME,
            injectMode: metadata.injectMode,
            provider: metadata.provider,
          };
          instance[key] = await this.resolveAsync(options, key);
        } catch (error) {
          if (DefinitionNotFoundException.isClosePrototypeOf(error)) {
            const className = definition.target.name;
            error.updateErrorMsg(className);
          }
          this.removeCreateStatus(definition, true);
          throw error;
        }
      }
    }

    this.context.emit(ObjectLifeCycle.AFTER_CREATED, instance, {
      context: this.context,
      definition,
      replaceCallback: (ins: any) => {
        instance = ins;
      },
    });

    await definition.creator.doInitAsync(instance);

    this.context.emit(ObjectLifeCycle.AFTER_INIT, instance, {
      context: this.context,
      definition,
    });

    if (definition.isSingletonScope() && definition.id) {
      this.singletonCache.set(definition.id, instance);
    }

    if (definition.isRequestScope() && definition.id) {
      this.context.registerObject(definition.id, instance);
    }
    this.removeCreateStatus(definition, true);

    return instance;
  }

  resolve(resolveOpts: ResolveOptions, originPropertyName: string): any {
    const resolver = this.resolvers.get(resolveOpts.type);
    if (!resolver || resolver.getName() !== resolveOpts.type) {
      throw new ResolverMissingException(resolveOpts.type);
    }
    return resolver.resolve(resolveOpts, originPropertyName);
  }

  async resolveAsync(resolveOpts: ResolveOptions, originPropertyName: string): Promise<any> {
    const resolver = this.resolvers.get(resolveOpts.type);
    if (!resolver || resolver.getName() !== resolveOpts.type) {
      throw new ResolverMissingException(resolveOpts.type);
    }
    return resolver.resolveAsync(resolveOpts, originPropertyName);
  }

  private createProxy(definition: BeanDefinition) {
    if (this.isCreating(definition)) {
      if (!this.depthFirstSearch(definition.id, definition)) {
        return null;
      }
      // 创建代理对象
      return new Proxy(
        { __is_proxy__: true, __target_id__: definition.id },
        {
          get: (_obj, prop) => {
            let target: any;
            if (definition.isRequestScope()) {
              target = this.context.registry.getObject(definition.id);
            } else if (definition.isSingletonScope()) {
              target = this.singletonCache.get(definition.id);
            } else {
              target = this.context.get(definition.id);
            }
            if (target) {
              if (typeof target[prop] === 'function') {
                return target[prop].bind(target);
              }
              return target[prop];
            }
            return undefined;
          },
        }
      );
    }
    return null;
  }

  private depthFirstSearch(identifier: Identifier, definition: BeanDefinition, depth?: Identifier[]): boolean {
    if (definition) {
      if (definition.kind === Kind.Class) {
        if (definition.fields) {
          const keys = definition.fields.fieldKeys();
          for (const key of keys) {
            if (!Array.isArray(depth)) {
              depth = [identifier];
            }
            let id = key;
            const ref: IFieldDefinition = definition.fields.getField(key);
            if (ref.decorator !== DecoratorName.AUTOWIRED) continue;
            if (ref && ref.propertyKey) {
              id = this.context.registry.aliasRegistry.getAlias(ref.propertyKey) ?? ref.propertyKey;
            }
            if (id === identifier) {
              return true;
            }
            if (depth.indexOf(id) > -1) {
              continue;
            } else {
              depth.push(id);
            }
            let subDefinition = this.context.registry.getDefinition(id);
            if (!subDefinition && this.context.parent) {
              subDefinition = this.context.parent.registry.getDefinition(id);
            }
            if (this.depthFirstSearch(identifier, subDefinition, depth)) {
              return true;
            }
          }
        }
        if (definition.parameters) {
          const constructorMethod = definition.parameters.getParameter('constructor');
          if (constructorMethod) {
            const parameters = constructorMethod.parameters;
            for (const parameter of parameters) {
              if (parameter && parameter.provider) {
                let id = parameter.provider;
                if (parameter && parameter.provider) {
                  id = this.context.registry.aliasRegistry.getAlias(parameter.provider) ?? parameter.provider;
                }
                if (id === identifier) {
                  return true;
                }
                if (depth.indexOf(id) > -1) {
                  continue;
                } else {
                  depth.push(id);
                }
                let subDefinition = this.context.registry.getDefinition(id);
                if (!subDefinition && this.context.parent) {
                  subDefinition = this.context.parent.registry.getDefinition(id);
                }
                if (this.depthFirstSearch(identifier, subDefinition, depth)) {
                  return true;
                }
              }
            }
          }
        }
      }
    }
    return false;
  }

  private compareAndSetCreateStatus(definition: BeanDefinition) {
    if (this.creating.has(definition.id)) {
      this.creating.set(definition.id, false);
    }
    return true;
  }

  private getConstructorParameters(definition: BeanDefinition, ...args: any[]): any[] {
    let parameters = [];
    if (args.length > 0) {
      parameters.push(...args);
    } else {
      if (definition.kind === Kind.Class) {
        if (definition.parameters) {
          const methodDefinition = definition.parameters.getParameter('constructor');
          if (methodDefinition) {
            parameters = new Array(methodDefinition.maxParams).fill(null);
            for (const parameter of methodDefinition.parameters) {
              parameters[parameter.index] = this.context.get(parameter.provider);
            }
          }
        }
      }
    }
    return parameters;
  }

  private checkSingletonInvokeRequest(definition: BeanDefinition, key: Identifier) {
    if (definition.kind === Kind.Class && definition.isSingletonScope()) {
      const fieldDefinition = definition.fields.getField(key);
      const metadata: AutowiredFieldMetadata = fieldDefinition.metadata;
      if (this.context.registry.hasDefinition(metadata?.provider)) {
        const providerDefinition = this.context.registry.getDefinition(metadata.provider);
        if (providerDefinition.isRequestScope() && !providerDefinition.allowDowngrade) {
          throw new SingletonInjectRequestException(definition.target.name, providerDefinition.target.name);
        }
      }
    }
    return true;
  }

  private isCreating(definition: IObjectBeanDefinition): boolean {
    return this.creating.has(definition.id) && this.creating.get(definition.id);
  }

  private removeCreateStatus(definition: BeanDefinition, success: boolean = false): boolean {
    if (this.creating.has(definition.id)) {
      this.creating.set(definition.id, success);
    }
    return true;
  }

  async destroy(): Promise<void> {
    for (const key of this.singletonCache.keys()) {
      const definition = this.context.registry.getDefinition(key);
      if (definition.creator) {
        const inst = this.singletonCache.get(key);
        this.context.emit(ObjectLifeCycle.BEFORE_DESTROY, inst, {
          context: this.context,
          definition,
        });
        await definition.creator.doDestroyAsync(inst);
      }
    }
    this.singletonCache.clear();
    this.creating.clear();
  }
}
