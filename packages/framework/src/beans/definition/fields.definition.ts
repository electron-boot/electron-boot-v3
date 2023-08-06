import { Identifier } from '../../interface/common.interface';
import { IFieldDefinition, IFieldsDefinition } from '../../interface/beans.interface';

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
