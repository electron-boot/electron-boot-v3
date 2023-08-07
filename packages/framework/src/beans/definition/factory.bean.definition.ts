import { ObjectBeanDefinition } from './object.bean.definition';
import { Kind } from '../../enums/enums';
import { FactoryCreatorDefinition } from './factory.creator.definition';
import { IFactoryBeanDefinition } from '../../interface/beans/definition/factory.bean.definition';

export class FactoryBeanDefinition extends ObjectBeanDefinition implements IFactoryBeanDefinition {
  kind: Kind.Factory;
  creator: FactoryCreatorDefinition = new FactoryCreatorDefinition(this);
}
