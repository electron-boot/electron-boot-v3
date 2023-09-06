import { ClassMethodDecoratorFunction } from '../interface/decorator/decorators.interface';
import { DecoratorManager } from './decorator.manager';
import { ObjectBeanFactory } from '../beans/support/object.bean.factory';
export interface ConstructDecorator {
  /**
   * init decorator
   * @example
   * ```typescript
   * @Init()
   * userService: UserService;
   */
  (): ClassMethodDecoratorFunction<any, any, any>;
  /**
   * init decorator
   * @param target
   * @param context
   * @example
   * ```typescript
   * @Init
   * userService: UserService;
   */
  (target: any, context: ClassMethodDecoratorContext): void;
}
export const Construct: ConstructDecorator = DecoratorManager.createDecorator((target, context) => {
  const beanDefinition = DecoratorManager.getBeanDefinition(context, ObjectBeanFactory.classBeanDefinition(context));
  beanDefinition.constructMethod = context.name.toString();
  beanDefinition.save();
});
export interface InitDecorator {
  /**
   * init decorator
   * @example
   * ```typescript
   * @Init()
   * userService: UserService;
   */
  (): ClassMethodDecoratorFunction<any, any, any>;
  /**
   * init decorator
   * @param target
   * @param context
   * @example
   * ```typescript
   * @Init
   * userService: UserService;
   */
  (target: any, context: ClassMethodDecoratorContext): void;
}
export const Init: InitDecorator = DecoratorManager.createDecorator((target, context) => {
  const beanDefinition = DecoratorManager.getBeanDefinition(context, ObjectBeanFactory.classBeanDefinition(context));
  beanDefinition.initMethod = context.name.toString();
  beanDefinition.save();
});

export interface DestroyDecorator {
  /**
   * init decorator
   * @example
   * ```typescript
   * @Init()
   * userService: UserService;
   */
  (): ClassMethodDecoratorFunction<any, any, any>;
  /**
   * init decorator
   * @param target
   * @param context
   * @example
   * ```typescript
   * @Init
   * userService: UserService;
   */
  (target: any, context: ClassMethodDecoratorContext): void;
}
export const Destroy: DestroyDecorator = DecoratorManager.createDecorator((target, context) => {
  const beanDefinition = DecoratorManager.getBeanDefinition(context, ObjectBeanFactory.classBeanDefinition(context));
  beanDefinition.destroyMethod = context.name.toString();
  beanDefinition.save();
});
