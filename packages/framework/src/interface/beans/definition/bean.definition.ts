import { IClassBeanDefinition } from './class.bean.definition';
import { IFactoryBeanDefinition } from './factory.bean.definition';

export type BeanDefinition = IClassBeanDefinition | IFactoryBeanDefinition;
