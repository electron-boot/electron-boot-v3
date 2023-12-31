import { Kind, Scope } from '../../enums/enums';
import { IObjectBeanDefinition } from '../../interface/beans/definition/object.bean.definition';
import { IObjectCreatorDefinition } from '../../interface/beans/definition/object.creator.definition';
import { Identifier } from '../../interface/common';
import { DecoratorManager } from '../../decorators/decorator.manager';

export abstract class ObjectBeanDefinition implements IObjectBeanDefinition {
  id: string;
  abstract kind: Kind;
  decoratorMetadataObject: DecoratorMetadataObject;
  fieldsMerge = false;
  allowDowngrade = false;
  alias: Identifier[] = [];
  name: string;
  originName: string;
  target: any;
  export: string;
  scope: Scope = Scope.Request;
  creator: IObjectCreatorDefinition;
  constructMethod: string;
  destroyMethod: string;
  initMethod: string;
  isSingletonScope(): boolean {
    return this.scope === Scope.Singleton;
  }
  isRequestScope(): boolean {
    return this.scope === Scope.Request;
  }
  save() {
    if (this.decoratorMetadataObject) {
      DecoratorManager.saveBeanDefinition(this.decoratorMetadataObject, this);
    } else {
      DecoratorManager.saveBeanDefinition(this.target, this);
    }
  }
}
