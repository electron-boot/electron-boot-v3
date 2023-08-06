import { DecoratorName, DecoratorUtil } from '../utils/decorator.util';
import { RouterOption } from '../interface/metadata.interface';
import { ClassMethodDecoratorFunction } from '../interface/decorators.interface';
export interface ActionDecorator {
  /**
   * injectable decorator
   * @param path current class
   * @example
   * ```typescript
   * @Action('/test')
   * function test(){
   *
   * }
   */
  (path: string): ClassMethodDecoratorFunction<any, any, any>;
  /**
   * injectable decorator
   * @param path current class
   * @param options current class context
   * @example
   * ```typescript
   * @Action('/test')
   * function test(){
   *
   * }
   */
  (path: string, options?: RouterOption): ClassMethodDecoratorFunction<any, any, any>;
}
export const Action: ActionDecorator = DecoratorUtil.createDecorator(
  (
    target,
    context: any,
    path: string,
    option: RouterOption = {
      path: '/',
      routerName: null,
    }
  ) => {
    path = path || option.path || '/';
    const routerName = option.routerName;
    let metadata = DecoratorUtil.getMetadata<Array<RouterOption>>(context, DecoratorName.ACTION);
    if (!metadata) {
      metadata = [];
    }
    metadata.push({
      path,
      routerName,
      method: context.name,
    });
    DecoratorUtil.saveMetadata(context, DecoratorName.ACTION, metadata);
  }
);
