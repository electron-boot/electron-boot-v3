import { DecoratorName, DecoratorManager } from './decorator.manager';
import { ClassDecoratorFunction } from '../interface/decorator/decorators.interface';
import { ControllerMetadata } from '../interface';
import { Provide } from './provide.decorator';
import { Scope } from '../enums/enums';

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
export const Controller: ControllerDecorator = DecoratorManager.createDecorator((target, context: ClassDecoratorContext, customName?: string) => {
  DecoratorManager.saveModule(DecoratorName.CONTROLLER, target);
  DecoratorManager.saveMetadata(context, DecoratorName.CONTROLLER, {
    controllerName: context.name,
    customName: customName,
  } as ControllerMetadata);
  Provide({ scope: Scope.Request })(target, context);
});
