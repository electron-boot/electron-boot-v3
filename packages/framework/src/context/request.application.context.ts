import { GenericApplicationContext } from './generic.application.context';
import { DecoratorName, DecoratorUtil } from '../utils/decorator.util';
import { ArrayUtil } from '../utils/array.util';
import { IApplicationContext } from '../interface/context/application.context.interface';

export class RequestApplicationContext extends GenericApplicationContext {
  private readonly applicationContext: IApplicationContext;
  private objectMap: Map<string, any> = new Map();
  private attrMap: Map<string, any> = new Map();
  constructor(ctx: any, applicationContext: IApplicationContext) {
    super(applicationContext);
    this.applicationContext = applicationContext;

    this.registry.aliasRegistry = this.applicationContext.aliasRegistry;

    this.ctx = ctx;

    this.registerObject('ctx', this);
    // register res
    this.registerObject('res', {});
  }

  registerObject(identifier: any, target?: any, replace?: boolean) {
    if (!this.objectMap) {
      return super.registerObject(identifier, target, replace);
    }
    return this.objectMap.set(identifier, target);
  }

  private getIdentifier(identifier: any): string {
    return DecoratorUtil.getBeanDefinition(identifier).id;
  }

  public setAttr(key: string, value) {
    this.attrMap.set(key, value);
  }

  public getAttr<T>(key: string): T {
    return this.attrMap.get(key);
  }

  public hasAttr(key: string): boolean {
    return this.attrMap.has(key);
  }

  get<T = any>(identifier: any, args?: any): T {
    if (typeof identifier !== 'string') {
      identifier = this.getIdentifier(identifier);
    }

    if (this.attrMap.has(identifier)) {
      return this.attrMap.get(identifier);
    }

    if (this.objectMap.has(identifier)) {
      return this.objectMap.get(identifier);
    }

    if (this.registry.hasObject(identifier)) {
      return this.registry.getObject(identifier);
    }

    const definition = this.applicationContext.registry.getDefinition(identifier);
    if (definition) {
      if (definition.isRequestScope() || ArrayUtil.contains(definition.alias, DecoratorName.PIPELINE_IDENTIFIER)) {
        // create object from applicationContext definition for requestScope
        return this.resolveFactoryManager.doCreate(definition, args);
      }
    }

    if (this.parent) {
      return this.parent.get(identifier, args);
    }
  }

  async getAsync<T = any>(identifier: any, args?: any): Promise<T> {
    if (typeof identifier !== 'string') {
      identifier = this.getIdentifier(identifier);
    }

    if (this.attrMap.has(identifier)) {
      return this.attrMap.get(identifier);
    }

    if (this.objectMap.has(identifier)) {
      return this.objectMap.get(identifier);
    }

    if (this.registry.hasObject(identifier)) {
      return this.registry.getObject(identifier);
    }

    const definition = this.applicationContext.registry.getDefinition(identifier);
    if (definition) {
      if (definition.isRequestScope() || ArrayUtil.contains(definition.alias, DecoratorName.PIPELINE_IDENTIFIER)) {
        // create object from applicationContext definition for requestScope
        return this.resolveFactoryManager.doCreateAsync(definition, args);
      }
    }

    if (this.parent) {
      return this.parent.getAsync<T>(identifier, args);
    }
  }
}
