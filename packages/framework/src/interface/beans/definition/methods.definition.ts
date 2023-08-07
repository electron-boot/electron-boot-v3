import { Identifier } from '../../common';
import { IMethodDefinition } from './method.definition';

export interface IMethodsDefinition {
  setMethod(name: Identifier, definition: IMethodDefinition): this;
  getMethod(name: Identifier, defaultValue?: IMethodDefinition): IMethodDefinition;
  methodKeys(): Identifier[];
}
