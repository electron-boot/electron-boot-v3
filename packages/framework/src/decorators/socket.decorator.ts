import { DecoratorName, DecoratorManager } from './decorator.manager';
import { Singleton } from './singleton.decorator';
import { ProviderOptions } from './provide.decorator';
import { ClassDecoratorFunction } from '../interface/decorator/decorators.interface';
import { Identifier } from '../interface/common';

export interface SocketDecorator {
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
export const Socket: SocketDecorator = DecoratorManager.createDecorator((target, context: any, identifier?: Identifier) => {
  DecoratorManager.saveModule(DecoratorName.SOCKET, target);
  Singleton(identifier)(target, context);
});
