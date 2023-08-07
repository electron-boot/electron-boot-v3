import { Identifier } from '../../common';
import { IMethodDefinition } from './method.definition';

export interface IParametersDefinition {
  setParameter(name: Identifier, definition: IMethodDefinition): this;
  getParameter(name: Identifier, defaultValue?: IMethodDefinition): IMethodDefinition;
  parameterKeys(): Identifier[];
}
