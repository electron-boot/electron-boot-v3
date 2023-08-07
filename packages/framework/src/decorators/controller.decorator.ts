import { ControllerOption, RouterOptions } from '../interface/decorator/metadata.interface';
import { DecoratorName, DecoratorUtil } from '../utils/decorator.util';
import { Singleton } from './singleton.decorator';
import { ClassDecoratorFunction } from '../interface/decorator/decorators.interface';

export interface ControllerDecorator {
  /**
   * injectable decorator
   * @param prefix prefix path
   * @param routerOptions router options
   * @example
   * ```typescript
   * @Controller('/api', { tagName: 'api' })
   * class A {}
   */
  (prefix: string, routerOptions: RouterOptions): ClassDecoratorFunction<any, any, any>;
  /**
   * injectable decorator
   * @param prefix prefix path
   * @example
   * ```typescript
   * @Controller('/api')
   * class A {}
   */
  (prefix: string): ClassDecoratorFunction<any, any, any>;
  /**
   * injectable decorator
   * @example
   * ```typescript
   * @Controller
   * class A {}
   */
  (): ClassDecoratorFunction<any, any, any>;
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
export const Controller: ControllerDecorator = DecoratorUtil.createDecorator(
  (target, context: any, prefix: string = '/', routerOptions: RouterOptions = {}) => {
    DecoratorUtil.saveModule(DecoratorName.CONTROLLER, target);
    if (prefix) {
      DecoratorUtil.saveMetadata(context, DecoratorName.CONTROLLER, {
        prefix,
        routerOptions,
      } as ControllerOption);
    }
    Singleton()(target, context);
  }
);
