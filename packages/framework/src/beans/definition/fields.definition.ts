import { IFieldsDefinition } from '../../interface/beans/definition/fields.definition';
import { IFieldDefinition } from '../../interface/beans/definition/field.definition';
import { Identifier } from '../../interface/common';

export class FieldsDefinition extends Map<Identifier, any> implements IFieldsDefinition {
  fieldKeys(): Identifier[] {
    return Array.from(this.keys());
  }

  getField(key: Identifier, defaultValue?: IFieldDefinition): IFieldDefinition {
    if (this.has(key)) {
      return this.get(key);
    } else {
      return defaultValue;
    }
  }

  setField(key: Identifier, definition: IFieldDefinition): this {
    return this.set(key, definition);
  }
}
