import { GenericApplicationContext } from './generic.application.context';
import { IApplicationContext } from '../interface/context.interface';
import { DecoratorName, DecoratorUtil } from '../utils/decorator.util';
import { ArrayUtil } from '../utils/array.util';

export class RequestApplicationContext extends GenericApplicationContext {
  private readonly applicationContext: IApplicationContext;
  constructor(ctx: any, applicationContext: IApplicationContext) {
    super(applicationContext);
    this.applicationContext = applicationContext;

    this.registry.aliasRegistry = this.applicationContext.aliasRegistry;

    this.ctx = ctx;

    this.registerObject('ctx', this);
    // register res
    this.registerObject('res', {});
  }

  private getIdentifier(identifier: any): string {
    return DecoratorUtil.getBeanDefinition(identifier).id;
  }

  get<T = any>(identifier: any, args?: any): T {
    if (typeof identifier !== 'string') {
      identifier = this.getIdentifier(identifier);
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
