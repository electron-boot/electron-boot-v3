import { ClassType, Decorator, Identifier } from './common.interface';

export type CreateDecoratorCallBack = (target: any, context: DecoratorContext, ...args: any[]) => any;

export type ProviderIdentifier = Identifier | ClassType;
export interface ModuleStore {
  /**
   * save module
   * @param decorator
   * @param module
   */
  saveModule(decorator: Decorator, module: any): void;

  /**
   * get module list
   * @param decorator {Decorator} decorator name
   */
  listModules(decorator: Decorator): any[];

  /**
   * transform module map
   * @param moduleMap
   */
  transformModule?(moduleMap: Map<Decorator, Set<any>>): void;
}

export type DecoratorTarget = ClassType | DecoratorContext | DecoratorMetadata;

/**
 * typescript new class decorator
 */
export type ClassDecoratorFunction<
  BaseClassType extends ClassType<unknown>,
  ReturnsModified extends boolean,
  Arguments extends any[] | false,
> = Arguments extends any[]
  ? (...args: Arguments) => ClassDecoratorFunction<BaseClassType, ReturnsModified, false>
  : (baseClass: BaseClassType, context?: ClassDecoratorContext) => ReturnsModified extends true ? BaseClassType : void;

/**
 * typescript new class member decorator
 */
export type ClassMemberDecoratorFunction<
  BaseClassType extends ClassType<unknown>,
  ReturnsModified extends boolean,
  Arguments extends any[] | false,
> = Arguments extends any[]
  ? (...args: Arguments) => ClassMemberDecoratorFunction<BaseClassType, ReturnsModified, false>
  : (baseClass: BaseClassType, context?: ClassMemberDecoratorContext) => ReturnsModified extends true ? BaseClassType : void;

/**
 * typescript new class field decorator
 */
export type ClassFieldDecoratorFunction<
  BaseClassType extends ClassType<unknown>,
  ReturnsModified extends boolean,
  Arguments extends any[] | false,
> = Arguments extends any[]
  ? (...args: Arguments) => ClassFieldDecoratorFunction<BaseClassType, ReturnsModified, false>
  : (baseClass: BaseClassType, context?: ClassFieldDecoratorContext) => ReturnsModified extends true ? BaseClassType : void;

/**
 * typescript new class field decorator
 */
export type ClassMethodDecoratorFunction<
  BaseClassType extends ClassType<unknown>,
  ReturnsModified extends boolean,
  Arguments extends any[] | false,
> = Arguments extends any[]
  ? (...args: Arguments) => ClassFieldDecoratorFunction<BaseClassType, ReturnsModified, false>
  : (baseClass: BaseClassType, context?: ClassMethodDecoratorContext) => ReturnsModified extends true ? BaseClassType : void;
