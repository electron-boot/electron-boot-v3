import { Kind, Scope } from '../../enums/enums';
import { IObjectBeanDefinition } from '../../interface/beans/definition/object.bean.definition';
import { IObjectCreatorDefinition } from '../../interface/beans/definition/object.creator.definition';
import { StringUtil } from '../../utils/string.util';
import { DecoratorUtil } from '../../utils';
import { Identifier } from '../../interface/common';

export abstract class ObjectBeanDefinition implements IObjectBeanDefinition {
  id: string = StringUtil.generateUUID();
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
      DecoratorUtil.saveBeanDefinition(this.decoratorMetadataObject, this);
    } else {
      DecoratorUtil.saveBeanDefinition(this.target, this);
    }
  }
}
