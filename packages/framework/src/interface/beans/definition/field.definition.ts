import { Identifier } from '../../common';

export interface IFieldDefinition {
  /**
   * the field decorator name
   * @type string
   * @memberof IFieldDefinition
   */
  decorator: string | symbol;
  /**
   * the property key of field
   * @type {Identifier}
   * @memberof IFieldDefinition
   */
  propertyKey: Identifier;
  /**
   * the field metadata
   * @type {*}
   * @memberof IFieldDefinition
   */
  metadata: any;
  /**
   * the field impl or not
   * @type {boolean}
   * @memberof IFieldDefinition
   */
  impl?: boolean;
}
