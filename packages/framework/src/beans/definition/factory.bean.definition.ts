import { ObjectBeanDefinition } from './object.bean.definition';
import { Kind } from '../../enums/enums';
import { IFactoryBeanDefinition } from '../../interface/beans.interface';
import { FactoryCreatorDefinition } from './factory.creator.definition';

export class FactoryBeanDefinition extends ObjectBeanDefinition implements IFactoryBeanDefinition {
  kind: Kind.Factory;
  creator: FactoryCreatorDefinition = new FactoryCreatorDefinition(this);
}
