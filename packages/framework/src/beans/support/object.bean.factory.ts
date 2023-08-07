import { IClassBeanDefinition, IFactoryBeanDefinition } from '../../interface';
import { StringUtil } from '../../utils';
import { ClassBeanDefinition, FactoryBeanDefinition } from '../definition';

export class ObjectBeanFactory {
  static classBeanDefinition(target: any): IClassBeanDefinition {
    const beanDefinition = new ClassBeanDefinition();
    if (target.kind) {
      beanDefinition.decoratorMetadataObject = target.metadata;
    } else {
      beanDefinition.target = target;
      beanDefinition.name = StringUtil.camelCase(target.name);
      beanDefinition.originName = target.name;
    }
    beanDefinition.id = StringUtil.generateUUID();
    return beanDefinition;
  }
  static factoryBeanDefinition(target: any): IFactoryBeanDefinition {
    const beanDefinition = new FactoryBeanDefinition();
    beanDefinition.id = StringUtil.generateUUID();
    beanDefinition.target = target;
    beanDefinition.name = StringUtil.camelCase(target.name);
    beanDefinition.originName = target.name;
    return beanDefinition;
  }
}
