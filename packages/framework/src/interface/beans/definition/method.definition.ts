import { Identifier } from '../../common';
import { IParameterDefinition } from './parameter.definition';
export interface MethodDecoratorOptions {
  impl?: boolean;
}
export interface IMethodDefinition {
  /**
   * the field decorator name
   * @type string
   * @memberof IFieldDefinition
   */
  decorator: string | symbol;
  /**
   * The method max params number.
   * @export
   * @type {number}
   * @memberof IMethodDefinition
   */
  maxParams: number;
  /**
   * The method name.
   * @export
   * @type {Identifier}
   * @memberof IMethodDefinition
   */
  methodName: Identifier;
  /**
   * The method parameters.
   * @export
   * @type {Array<IParameterDefinition>}
   * @memberof IMethodDefinition
   */
  parameters: Array<IParameterDefinition>;
  /**
   * The method metadata.
   * @export
   * @type {*}
   * @memberof IMethodDefinition
   */
  metadata?: any;
  /**
   * The method impl or not
   * @type {boolean}
   * @memberof IMethodDefinition
   */
  options?: MethodDecoratorOptions;
}
