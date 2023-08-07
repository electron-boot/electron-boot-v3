import { ObjectCreatorDefinition } from './object.creator.definition';
import { IApplicationContext } from '../../interface/context/application.context.interface';

export class FactoryCreatorDefinition extends ObjectCreatorDefinition {
  doConstruct(clazz: any, args?: any, context?: IApplicationContext): any {
    if (!clazz) {
      return null;
    }
    return clazz(context, args);
  }

  async doConstructAsync(clazz: any, args?: any, context?: IApplicationContext): Promise<any> {
    if (!clazz) {
      return null;
    }

    return clazz(context, args);
  }
}
