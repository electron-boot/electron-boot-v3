import { DecoratorName, DecoratorUtil } from '../utils/decorator.util';
import { ClassMethodDecoratorFunction } from '../interface/decorator/decorators.interface';
import { ActionMetadata } from '../interface';
export interface EventDecorator {
  /**
   * Event decorator
   * @example
   * ```typescript
   * @Event("test")
   * function test(){
   * }
   */
  (customName?: string): ClassMethodDecoratorFunction<any, any, any>;
  /**
   * Event decorator
   * @param target
   * @param context
   * @example
   * ```typescript
   * @Event
   * function test(){
   * }
   */
  (target: any, context: ClassMethodDecoratorContext);
}
export const Event: EventDecorator = DecoratorUtil.createDecorator((target, context: ClassMethodDecoratorContext, customname?: string) => {
  let metadata = DecoratorUtil.getMetadata<Array<ActionMetadata>>(context, DecoratorName.ACTION);
  if (!metadata) {
    metadata = [];
  }
  metadata.push({
    actionName: context.name as string,
    customName: customname,
  });
  DecoratorUtil.saveMetadata(context, DecoratorName.ACTION, metadata);
});
