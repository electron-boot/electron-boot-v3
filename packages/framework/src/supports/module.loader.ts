import { DynamicModule, Provider } from '../interface/decorator/metadata.interface';
import { isClass, isPromise } from '../utils/types.util';
import { DecoratorName, DecoratorManager } from '../decorators/decorator.manager';
import { Scope } from '../enums/enums';
import { ConfigService } from './service/config.service';
import { IApplicationContext } from '../interface/context/application.context.interface';
import { Type } from '../interface/common';
import { ObjectBeanFactory } from '../beans/support/object.bean.factory';

export class ModuleLoader {
  private loaded: WeakMap<any, boolean> = new WeakMap();
  private context: IApplicationContext;
  constructor(context: IApplicationContext) {
    this.context = context;
  }

  load(module: Type | DynamicModule | Promise<DynamicModule>) {
    if (this.loaded.get(module)) return;
    let moduleInfo: DynamicModule;
    if (isPromise(module)) {
      return (module as Promise<DynamicModule>).then(m => this.load(m));
    }
    if (isClass(module)) {
      moduleInfo = DecoratorManager.getMetadata(<Type>module, DecoratorName.MODULE);
      if (!moduleInfo) {
        const beanDefinition = DecoratorManager.getBeanDefinition(module as Type, ObjectBeanFactory.classBeanDefinition(module));
        beanDefinition.scope = Scope.Singleton;
        beanDefinition.target = module as Type;
        beanDefinition.save();
        return this.context.register(module);
      }
      moduleInfo.module = module as Type;
      return this.load(moduleInfo);
    }
    moduleInfo = module as DynamicModule;
    if (!moduleInfo) return;
    this.addProviders(moduleInfo.providers);
    this.addConfigs(moduleInfo.configs);
    this.addConfigFilter(moduleInfo.configFilter);
    this.addImports(moduleInfo.imports);
    this.bindModuleClass(moduleInfo.module);
    this.loaded.set(module, true);
  }

  bindModuleClass(clazz: Type) {
    const beanDefinition = DecoratorManager.getBeanDefinition(clazz, ObjectBeanFactory.classBeanDefinition(clazz));
    beanDefinition.scope = Scope.Singleton;
    beanDefinition.target = clazz;
    beanDefinition.save();
    this.context.registerClass(undefined, clazz);
    const configurationMods = DecoratorManager.listModules(DecoratorName.MODULE);
    const exists = configurationMods.find(mod => {
      return mod.target === clazz;
    });
    if (!exists) {
      DecoratorManager.saveModule(DecoratorName.MODULE, {
        target: clazz,
      });
    }
  }

  addProviders(providers: Array<Provider<any>> = []) {
    for (const provider of providers) {
      if (isClass(provider)) {
        this.context.registerClass(undefined, <Type>provider);
      } else if ('class' in provider) {
        this.context.registerClass(provider.identifier, provider.class);
      } else if ('value' in provider) {
        this.context.registerObject(provider.identifier, provider.value);
      } else if ('factory' in provider) {
        this.context.registerFactory(provider.identifier, provider.factory);
      }
    }
  }

  addConfigs(configs?: Array<{ [p: string]: Record<string, any> }> | Record<string, any>) {
    if (configs) {
      if (Array.isArray(configs)) {
        this.context.get(ConfigService).add(configs);
      } else {
        this.context.get(ConfigService).addObject(configs);
      }
    }
  }

  addConfigFilter(configFilter: any) {
    this.context.get(ConfigService).addFilter(configFilter);
  }

  addImports(imports: Array<Type | DynamicModule | Promise<DynamicModule>> = []) {
    for (const importPackage of imports) {
      this.load(importPackage);
    }
  }
}
