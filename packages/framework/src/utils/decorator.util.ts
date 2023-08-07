import { CreateDecoratorCallBack, DecoratorTarget, ModuleStore } from '../interface/decorator/decorators.interface';
import { Decorator } from '../interface/common';
import { SymbolMetadata } from './symbol.util';
import { TypesUtil } from './types.util';
import { FieldsDefinition } from '../beans/definition/fields.definition';
import { IObjectBeanDefinition } from '../interface/beans/definition/object.bean.definition';
import { IClassBeanDefinition } from '../interface/beans/definition/class.bean.definition';
import { FactoryInfoDefinition } from '../interface/beans/definition/factory.bean.info.definition';
import { IFactoryBeanDefinition } from '../interface';
import { ObjectBeanFactory } from '../beans/support/object.bean.factory';

export class DecoratorName {
  static APPLICATION_CONTEXT = Symbol('application_context');
  static PRELOAD_MODULE = Symbol('preload_module');
  static MODULE = Symbol('module');
  static FACTORY = Symbol('factory');
  static ASPECT = Symbol('aspect');
  static BEAN = Symbol('bean');
  static AUTOWIRED = Symbol('autowired');
  static SOCKET = Symbol('socket');
  static WINDOW = Symbol('window');
  static CONFIG = Symbol('config');
  static CONTROLLER = Symbol('controller');
  static ACTION = Symbol('action');
  static PIPELINE_IDENTIFIER = Symbol('pipeline_identifier');
}
export class DecoratorUtil implements ModuleStore {
  private moduleMap = new Map<Decorator, Set<any>>();
  private moduleStore: ModuleStore;
  private static store = new WeakMap<DecoratorMetadataObject, any>();
  private static instance: DecoratorUtil;
  listModules(decorator: Decorator): any[] {
    if (this.moduleStore) {
      return this.moduleStore.listModules(decorator);
    }
    return Array.from(this.moduleMap.get(decorator) || []);
  }
  saveModule(decorator: Decorator, module: any): void {
    if (this.moduleStore) {
      return this.moduleStore.saveModule(decorator, module);
    }
    if (!this.moduleMap.has(decorator)) {
      this.moduleMap.set(decorator, new Set());
    }
    this.moduleMap.get(decorator).add(module);
  }
  private static getInstance(): DecoratorUtil {
    if (!this.instance) {
      this.instance = new DecoratorUtil();
    }
    return this.instance;
  }

  static saveModule(decorator: Decorator, module: any) {
    this.getInstance().saveModule(decorator, module);
  }
  static listModules(decorator: Decorator): any[] {
    return this.getInstance().listModules(decorator);
  }
  static savePreloadModule(module: any) {
    this.saveModule(DecoratorName.PRELOAD_MODULE, module);
  }
  static getPreloadModules(): any[] {
    return this.listModules(DecoratorName.PRELOAD_MODULE);
  }
  static bindModuleStore(moduleStore: ModuleStore) {
    this.getInstance().moduleStore = moduleStore;
    moduleStore.transformModule(this.getInstance().moduleMap);
  }
  static createDecorator(callBack: CreateDecoratorCallBack): any {
    return (...args: any[]) => {
      //@example @Injectable()
      if (args.length < 1) {
        return (...args: any[]) => {
          return callBack(args[0], args[1]);
        };
      }
      //@example @Injectable
      if (args.length === 2 && args[1].kind) {
        return callBack(args[0], args[1]);
      }
      //@example @Injectable(...)
      const options: any[] = args;
      return (...args: any[]) => {
        return callBack(args[0], args[1], ...options);
      };
    };
  }
  static getDecoratorMetadataObject(target: DecoratorTarget): DecoratorMetadataObject {
    if (target[SymbolMetadata]) {
      target = target[SymbolMetadata];
    } else if ((target as DecoratorContext)?.metadata) {
      target = (target as DecoratorContext).metadata;
    }
    return target as DecoratorMetadata;
  }
  static getDecoratorDataMap(target: DecoratorMetadataObject): Map<Decorator, any> | undefined {
    if (this.store.has(target)) {
      return this.store.get(target);
    }
    return undefined;
  }
  static getMetadataKeys(target: DecoratorTarget): Decorator[] {
    return Array.from(this.getDecoratorDataMap(this.getDecoratorMetadataObject(target)).keys());
  }
  static saveMetadata(target: DecoratorTarget, decorator: Decorator, metadata: any) {
    target = this.getDecoratorMetadataObject(target);
    if (!this.store.has(target)) {
      this.store.set(target, new Map());
    }
    this.store.get(target)!.set(decorator, metadata);
  }
  static getMetadata<T>(target: DecoratorTarget, decorator: Decorator): T {
    return this.getDecoratorDataMap(this.getDecoratorMetadataObject(target))?.get(decorator);
  }

  static classBeanDefinition(target: any): IClassBeanDefinition {
    if (this.isProvider(target)) return;
    return ObjectBeanFactory.classBeanDefinition(target);
  }
  static factoryBeanDefinition(target: any): IFactoryBeanDefinition {
    if (this.isProvider(target)) return;
    return ObjectBeanFactory.factoryBeanDefinition(target);
  }
  static saveBeanDefinition(target: DecoratorTarget, beanDefinition: IObjectBeanDefinition) {
    this.saveMetadata(target, DecoratorName.BEAN, beanDefinition);
  }
  static getBeanDefinition<T extends IObjectBeanDefinition>(target: DecoratorTarget, defaultValue?: T): T {
    if (this.getMetadata(target, DecoratorName.BEAN)) {
      return this.getMetadata(target, DecoratorName.BEAN);
    }
    if (defaultValue) {
      return defaultValue;
    }
    return null;
  }
  static mergeExtendedFields(definition: IClassBeanDefinition): any {
    let fields = new FieldsDefinition();
    if (definition.fieldsMerge) return fields;
    if (definition.target) {
      const father = Reflect.getPrototypeOf(definition.target) as any;
      if (father && this.isProvider(father)) {
        const fatherDefinition = this.getBeanDefinition<IClassBeanDefinition>(father);
        if (fatherDefinition) {
          fields = this.mergeExtendedFields(fatherDefinition);
        }
      }
    }
    for (const fieldKeysKey of definition.fields.fieldKeys()) {
      fields.setField(fieldKeysKey, definition.fields.getField(fieldKeysKey));
    }
    definition.fieldsMerge = true;
    definition.fields = fields;
    return fields;
  }
  static isProvider(target: any): boolean {
    const beanDefinition = this.getBeanDefinition(target);
    return !!(beanDefinition && beanDefinition.id);
  }
  static FactoryWrapper(factoryInfo: FactoryInfoDefinition | Array<FactoryInfoDefinition>): void {
    if (Array.isArray(factoryInfo)) {
      factoryInfo.forEach(info => {
        this.FactoryWrapper(info);
      });
    } else {
      if (TypesUtil.isFunction(factoryInfo.provider)) {
        this.saveMetadata(factoryInfo.provider, DecoratorName.FACTORY, factoryInfo);
        const beanDefinition = this.factoryBeanDefinition(factoryInfo.provider);
        DecoratorUtil.saveBeanDefinition(factoryInfo.provider, beanDefinition);
      }
    }
  }
  static isFactory(target: any): boolean {
    const factoryInfo = this.getMetadata<FactoryInfoDefinition>(target, DecoratorName.FACTORY);
    return !!(factoryInfo && factoryInfo.identifier);
  }
}
