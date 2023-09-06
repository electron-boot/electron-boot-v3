import { IClassBeanDefinition } from '../../interface/beans/definition/class.bean.definition';
import { IFactoryBeanDefinition } from '../../interface/beans/definition/factory.bean.definition';
import { FactoryInfoDefinition } from '../../interface/beans/definition/factory.bean.info.definition';
import { camelCase } from 'lodash-es';
import { randomUUID } from 'crypto';
import { isFunction } from '../../utils/types.util';
import { ClassBeanDefinition } from '../definition/class.bean.definition';
import { FactoryBeanDefinition } from '../definition/factory.bean.definition';
import { DecoratorManager, DecoratorName } from '../../decorators/decorator.manager';

export class ObjectBeanFactory {
  static classBeanDefinition(target: any): IClassBeanDefinition {
    if (DecoratorManager.isProvider(target)) return;
    const beanDefinition = new ClassBeanDefinition();
    if (target.kind) {
      beanDefinition.decoratorMetadataObject = target.metadata;
    } else {
      beanDefinition.target = target;
      beanDefinition.name = camelCase(target.name);
      beanDefinition.originName = target.name;
    }
    beanDefinition.id = randomUUID();
    return beanDefinition;
  }
  static factoryBeanDefinition(target: any): IFactoryBeanDefinition {
    if (DecoratorManager.isProvider(target)) return;
    const beanDefinition = new FactoryBeanDefinition();
    beanDefinition.id = randomUUID();
    beanDefinition.target = target;
    beanDefinition.name = camelCase(target.name);
    beanDefinition.originName = target.name;
    return beanDefinition;
  }
  static FactoryWrapper(factoryInfo: FactoryInfoDefinition | Array<FactoryInfoDefinition>): void {
    if (Array.isArray(factoryInfo)) {
      factoryInfo.forEach(info => {
        this.FactoryWrapper(info);
      });
    } else {
      if (isFunction(factoryInfo.provider)) {
        DecoratorManager.saveMetadata(factoryInfo.provider, DecoratorName.FACTORY, factoryInfo);
        const beanDefinition = this.factoryBeanDefinition(factoryInfo.provider);
        DecoratorManager.saveBeanDefinition(factoryInfo.provider, beanDefinition);
      }
    }
  }
}
