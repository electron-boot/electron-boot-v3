import { ClassDecoratorFunction } from '../interface/decorator/decorators.interface';
import { DecoratorName, DecoratorManager } from './decorator.manager';
import { ModuleMetadata } from '../interface/decorator/metadata.interface';

export interface ModuleDecorator {
  /**
   * injectable decorator
   * @example
   * ```typescript
   * @Module({
   *    providers: [UserService],
   *    imports: [LoggerModule],
   * })
   * @param moduleOption
   */
  (moduleOption?: ModuleMetadata): ClassDecoratorFunction<any, any, any>;
}
export const Module: ModuleDecorator = DecoratorManager.createDecorator((target, context: DecoratorContext, metadata: ModuleMetadata) => {
  DecoratorManager.saveMetadata(context, DecoratorName.MODULE, metadata);
});
