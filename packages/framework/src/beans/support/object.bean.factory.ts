import { IClassBeanDefinition, IFactoryBeanDefinition } from '../../interface';
import { camelCase, generateUUID } from '../../utils';
import { ClassBeanDefinition, FactoryBeanDefinition } from '../definition';

export class ObjectBeanFactory {
  static classBeanDefinition(target: any): IClassBeanDefinition {
    const beanDefinition = new ClassBeanDefinition();
    if (target.kind) {
      beanDefinition.decoratorMetadataObject = target.metadata;
    } else {
      beanDefinition.target = target;
      beanDefinition.name = camelCase(target.name);
      beanDefinition.originName = target.name;
    }
    beanDefinition.id = generateUUID();
    return beanDefinition;
  }
  static factoryBeanDefinition(target: any): IFactoryBeanDefinition {
    const beanDefinition = new FactoryBeanDefinition();
    beanDefinition.id = generateUUID();
    beanDefinition.target = target;
    beanDefinition.name = camelCase(target.name);
    beanDefinition.originName = target.name;
    return beanDefinition;
  }
}
