import { ClassDecoratorFunction } from '../interface/decorators.interface';
import { Identifier } from '../interface/common.interface';
import { Provide, ProviderOptions } from './provide.decorator';
import { DecoratorUtil } from '../utils/decorator.util';
import { Scope } from '../enums/enums';

export interface SingletonDecorator {
  /**
   * injectable decorator
   * @param injectableOption injectable options
   * @example
   * ```typescript
   * @Injectable({ identifier: 'A' })
   * @param injectableOption
   */
  (injectableOption?: Pick<ProviderOptions, 'identifier'>): ClassDecoratorFunction<any, any, any>;
  /**
   * injectable decorator
   * @param identifier identifier
   * @example
   * ```typescript
   * @Injectable('A')
   * class A {}
   * ```
   */
  (identifier?: Identifier): ClassDecoratorFunction<any, any, any>;
  /**
   * injectable decorator
   * @param target current class
   * @param context current class context
   * @example
   * ```typescript
   * @Injectable
   * class A {}
   */
  (target: any, context: ClassDecoratorContext): void;
}
export const Singleton: SingletonDecorator = DecoratorUtil.createDecorator((target, context: any, identifier: Identifier) => {
  Provide(identifier, Scope.Singleton)(target, context);
});
