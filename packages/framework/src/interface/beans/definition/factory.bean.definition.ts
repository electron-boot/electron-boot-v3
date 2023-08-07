import { Kind } from '../../../enums/enums';
import { IObjectBeanDefinition } from './object.bean.definition';

export interface IFactoryBeanDefinition extends IObjectBeanDefinition {
  kind: Kind.Factory;
}
