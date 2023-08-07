/**
 * Identifier type
 * @type {Identifier}
 */
export type Identifier = string | symbol;
/**
 * decorator name type
 * @type {Decorator}
 */
export type Decorator = Identifier;
/**
 * function type
 * @export
 * @type {TFunction}
 */
export type TFunction = Function;
/**
 * abstract class type
 * @export
 * @extends {Function}
 * @interface AbstractType
 * @template T
 */
export interface AbstractType<T = any> extends TFunction {
  new?(...args: any[]): T;
}
/**
 * class type
 * @export
 * @extends {Function}
 * @interface Type
 * @template T
 */
export interface Type<T = any> extends AbstractType {
  new (...args: any[]): T;
}
/**
 * class type.
 * @export
 * @type {ClassType}
 * @interface ClassType
 * @template  T
 */
export type ClassType<T = any> = Type<T> | AbstractType<T>;
