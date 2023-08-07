import { Identifier } from '../../common';
import { InjectMode } from '../../../enums/enums';

export interface IParameterDefinition {
  /**
   * parameter provider
   * @type {Identifier}
   * @memberof IParameterDefinition
   */
  provider?: Identifier;
  /**
   * provider inject mode
   * @type {InjectMode}
   * @memberof IParameterDefinition
   */
  injectMode?: InjectMode;
  /**
   * Name of the method to which the parameter belongs
   * @type {Identifier}
   * @memberof IParameterDefinition
   */
  method: Identifier;
  /**
   * Index of the parameter in the method signature
   * @type {number}
   * @memberof IParameterDefinition
   */
  index: number;
}
