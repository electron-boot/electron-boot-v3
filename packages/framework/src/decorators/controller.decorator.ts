import { DecoratorName, DecoratorUtil } from '../utils/decorator.util';
import { Singleton } from './singleton.decorator';
import { ClassDecoratorFunction } from '../interface/decorator/decorators.interface';
import { ControllerMetadata } from '../interface';

export interface ControllerDecorator {
  /**
   * injectable decorator
   * @example
   * ```typescript
   * @Controller
   * class A {}
   */
  (customName?: string): ClassDecoratorFunction<any, any, any>;
  /**
   * injectable decorator
   * @param target current class
   * @param context current class context
   * @example
   * ```typescript
   * @Controller
   * class A {}
   */
  (target: any, context: ClassDecoratorContext): void;
}
export const Controller: ControllerDecorator = DecoratorUtil.createDecorator((target, context: ClassDecoratorContext, customName?: string) => {
  DecoratorUtil.saveModule(DecoratorName.CONTROLLER, target);
  DecoratorUtil.saveMetadata(context, DecoratorName.CONTROLLER, {
    controllerName: context.name,
    customName: customName,
  } as ControllerMetadata);
  Singleton()(target, context);
});
