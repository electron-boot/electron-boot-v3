import { DecoratorName, DecoratorManager } from './decorator.manager';
import { ClassFieldDecoratorFunction } from '../interface/decorator/decorators.interface';
import { Decorator, Identifier } from '../interface/common';
import { isFunction } from '../utils';
import { ObjectBeanFactory } from '../beans/support/object.bean.factory';

export type extendMetadata = (...args: any[]) => object;

export const createCustomFieldDecorator = (decorator: Decorator, extendMetadata?: extendMetadata, impl = false): any => {
  return DecoratorManager.createDecorator((target: any, context: DecoratorContext, ...args: any[]) => {
    const metadata = isFunction(extendMetadata) ? extendMetadata(...args) : {};
    const beanDefinition = DecoratorManager.getBeanDefinition(context, ObjectBeanFactory.classBeanDefinition(context));
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
export const Window: WindowDecorator = createCustomFieldDecorator(DecoratorName.WINDOW);

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
export const Config: ConfigDecorator = createCustomFieldDecorator(DecoratorName.CONFIG, (...args: any[]) => {
  const metadata: any = {};
  if (args.length > 0) {
    metadata.identifier = args.shift();
  }
  return metadata;
});
