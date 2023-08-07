import { ClassDecoratorFunction } from '../interface/decorator/decorators.interface';
import { DecoratorName, DecoratorUtil } from '../utils/decorator.util';
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
export const Module: ModuleDecorator = DecoratorUtil.createDecorator((target, context: DecoratorContext, metadata: ModuleMetadata) => {
  DecoratorUtil.saveMetadata(context, DecoratorName.MODULE, metadata);
});
