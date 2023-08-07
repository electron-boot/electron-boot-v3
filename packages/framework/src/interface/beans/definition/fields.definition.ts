import { Identifier } from '../../common';
import { IFieldDefinition } from './field.definition';

export interface IFieldsDefinition {
  setField(key: Identifier, definition: IFieldDefinition): this;
  getField(key: Identifier, defaultValue?: IFieldDefinition): IFieldDefinition;
  fieldKeys(): Identifier[];
}
