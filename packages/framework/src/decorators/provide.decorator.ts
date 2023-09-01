import { ClassDecoratorFunction } from '../interface/decorator/decorators.interface';
import { Scope } from '../enums/enums';
import { DecoratorManager } from './decorator.manager';
import { TypesUtil } from '../utils/types.util';
import { camelCase } from '../utils/string.util';
import { Identifier } from '../interface/common';
export interface ProviderOptions {
  /**
   * identifier
   */
  identifier?: Identifier;
  /**
   * scope
   */
  scope?: Scope;
}
export interface ProvideDecorator {
  /**
   * injectable decorator
   * @param injectableOption injectable options
   * @example
   * ```typescript
   * @provide({ identifier: 'A', scope: Scope.Singleton })
   * @param injectableOption
   */
  (injectableOption?: ProviderOptions): ClassDecoratorFunction<any, any, any>;
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
   * provide decorator
   * @param identifier identifier
   * @param scope scope
   * @example
   * ```typescript
   * @Injectable('A', Scope.Singleton)
   * class A {}
   * ```
   */
  (identifier?: Identifier, scope?: Scope): ClassDecoratorFunction<any, any, any>;
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
export const Provide = DecoratorManager.createDecorator((target, context: DecoratorContext, identifier: Identifier, scope: Scope) => {
  let options: ProviderOptions;
  if (TypesUtil.isMetadataObject(identifier)) {
    options = identifier as ProviderOptions;
  } else {
    options = { identifier, scope };
  }
  const beanDefinition = DecoratorManager.getBeanDefinition(context, DecoratorManager.classBeanDefinition(context));
  if (options.identifier) {
    beanDefinition.alias.push(options.identifier);
  }
  if (options.scope) {
    beanDefinition.scope = options.scope;
  }
  beanDefinition.target = target;
  beanDefinition.name = camelCase(context.name as string);
  beanDefinition.originName = context.name as string;
  beanDefinition.save();
}) as ProvideDecorator;
