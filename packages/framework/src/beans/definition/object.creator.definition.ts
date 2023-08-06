import { BeanDefinition, IObjectCreatorDefinition } from '../../interface/beans.interface';
import { TypesUtil } from '../../utils/types.util';
import { UseWrongMethodException } from '../../errors/exceptions/use.wrong.method.exception';

export abstract class ObjectCreatorDefinition implements IObjectCreatorDefinition {
  protected definition: BeanDefinition;
  constructor(definition: BeanDefinition) {
    this.definition = definition;
  }
  load(): any {
    let clazz = null;
    if (typeof this.definition.target === 'string') {
      const path = this.definition.target;
      if (this.definition.export) {
        clazz = require(path)[this.definition.export];
      } else {
        clazz = require(path);
      }
    } else {
      clazz = this.definition.target;
    }
    return clazz;
  }
  doConstruct(clazz: any, args?: any[]): any {
    if (!clazz) {
      return Object.create(null);
    }

    let inst;
    if (this.definition.constructMethod) {
      // eslint-disable-next-line prefer-spread
      inst = clazz[this.definition.constructMethod].apply(clazz, args);
    } else {
      inst = Reflect.construct(clazz, args);
    }
    return inst;
  }

  async doConstructAsync(clazz: any, args?: any[]): Promise<any> {
    if (!clazz) {
      return Object.create(null);
    }

    let instance: any;
    if (this.definition.constructMethod) {
      const fn = clazz[this.definition.constructMethod];
      if (TypesUtil.isAsyncFunction(fn)) {
        instance = await fn.apply(clazz, args);
      } else {
        instance = fn.apply(clazz, args);
      }
    } else {
      instance = Reflect.construct(clazz, args);
    }
    return instance;
  }

  doInit(obj: any, ...args: any[]): void {
    const inst = obj;
    // after properties set then do init
    if (this.definition.initMethod && inst[this.definition.initMethod]) {
      if (TypesUtil.isGeneratorFunction(inst[this.definition.initMethod]) || TypesUtil.isAsyncFunction(inst[this.definition.initMethod])) {
        throw new UseWrongMethodException('context.get', 'context.getAsync', this.definition.id);
      } else {
        const rt = inst[this.definition.initMethod].call(inst, ...args);
        if (TypesUtil.isPromise(rt)) {
          throw new UseWrongMethodException('context.get', 'context.getAsync', this.definition.id);
        }
      }
    }
  }
  async doInitAsync(obj: any, ...args: any[]): Promise<void> {
    const inst = obj;
    if (this.definition.initMethod && inst[this.definition.initMethod]) {
      const initFn = inst[this.definition.initMethod];
      if (TypesUtil.isAsyncFunction(initFn)) {
        await initFn.call(inst, ...args);
      } else {
        if (initFn.length === 1) {
          await new Promise(resolve => {
            initFn.call(inst, ...args, resolve);
          });
        } else {
          initFn.call(inst, ...args);
        }
      }
    }
  }
  doDestroy(obj: any, ...args: any[]): void {
    if (this.definition.destroyMethod && obj[this.definition.destroyMethod]) {
      obj[this.definition.destroyMethod].call(obj, ...args);
    }
  }
  async doDestroyAsync(obj: any, ...args: any[]): Promise<void> {
    if (this.definition.destroyMethod && obj[this.definition.destroyMethod]) {
      const fn = obj[this.definition.destroyMethod];
      if (TypesUtil.isAsyncFunction(fn)) {
        await fn.call(obj);
      } else {
        if (fn.length === 1) {
          await new Promise(resolve => {
            fn.call(obj, ...args, resolve);
          });
        } else {
          fn.call(obj, ...args, ...args);
        }
      }
    }
  }
}
