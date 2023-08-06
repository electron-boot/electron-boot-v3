import { Decorator, Identifier } from '../interface/common.interface';
import { DecoratorName, DecoratorUtil } from '../utils/decorator.util';
import { ClassFieldDecoratorFunction } from '../interface/decorators.interface';

export const createCustomFieldDecorator = (decorator: Decorator, impl = false): any => {
  return DecoratorUtil.createDecorator((target: any, context: DecoratorContext, metadata: any = {}) => {
    const beanDefinition = DecoratorUtil.getBeanDefinition(context, DecoratorUtil.classBeanDefinition(context));
    const fieldDefinition = beanDefinition.fields.getField(context.name, {
      decorator: decorator,
      impl: impl,
      metadata: metadata,
      propertyKey: context.name,
    });
    beanDefinition.fields.setField(context.name, fieldDefinition);
    beanDefinition.save();
  });
};

export interface ApplicationContextDecorator {
  /**
   * application context decorator
   * @example
   * ```typescript
   * @ApplicationContext()
   * userService: UserService;
   */
  (): ClassFieldDecoratorFunction<any, any, any>;
  /**
   * application context decorator
   * @param target
   * @param context
   * @example
   * ```typescript
   * @ApplicationContext
   * userService: UserService;
   */
  (target: any, context: ClassFieldDecoratorContext): void;
}

export const ApplicationContext: ApplicationContextDecorator = createCustomFieldDecorator(DecoratorName.APPLICATION_CONTEXT);

export interface WindowDecorator {
  /**
   * application context decorator
   * @example
   * ```typescript
   * @Window()
   * userService: UserService;
   */
  (identifier?: Identifier): ClassFieldDecoratorFunction<any, any, any>;
  /**
   * application context decorator
   * @param target
   * @param context
   * @example
   * ```typescript
   * @Window
   * userService: UserService;
   */
  (target: any, context: ClassFieldDecoratorContext): void;
}
export const Window = createCustomFieldDecorator(DecoratorName.WINDOW);

export interface ConfigDecorator {
  /**
   * application context decorator
   * @example
   * ```typescript
   * @Window()
   * userService: UserService;
   */
  (identifier?: Identifier): ClassFieldDecoratorFunction<any, any, any>;
  /**
   * application context decorator
   * @param target
   * @param context
   * @example
   * ```typescript
   * @Window
   * userService: UserService;
   */
  (target: any, context: ClassFieldDecoratorContext): void;
}
export const Config = createCustomFieldDecorator(DecoratorName.CONFIG);
