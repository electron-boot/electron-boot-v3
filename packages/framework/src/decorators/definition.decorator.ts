import { ClassMethodDecoratorFunction } from '../interface/decorator/decorators.interface';
import { DecoratorUtil } from '../utils/decorator.util';
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
export const Construct: ConstructDecorator = DecoratorUtil.createDecorator((target, context) => {
  const beanDefinition = DecoratorUtil.getBeanDefinition(context, DecoratorUtil.classBeanDefinition(context));
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
export const Init: InitDecorator = DecoratorUtil.createDecorator((target, context) => {
  const beanDefinition = DecoratorUtil.getBeanDefinition(context, DecoratorUtil.classBeanDefinition(context));
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
export const Destroy: DestroyDecorator = DecoratorUtil.createDecorator((target, context) => {
  const beanDefinition = DecoratorUtil.getBeanDefinition(context, DecoratorUtil.classBeanDefinition(context));
  beanDefinition.destroyMethod = context.name.toString();
  beanDefinition.save();
});
