import { Identifier } from '../../interface/common.interface';
import { IMethodDefinition, IMethodsDefinition } from '../../interface/beans.interface';

export class MethodsDefinition extends Map<Identifier, any> implements IMethodsDefinition {
  getMethod(name: Identifier, defaultValue?: IMethodDefinition): IMethodDefinition {
    if (this.has(name)) {
      return this.get(name);
    }
    return defaultValue;
  }

  methodKeys(): Identifier[] {
    return Array.from(this.keys());
  }

  setMethod(name: Identifier, definition: IMethodDefinition): this {
    return this.set(name, definition);
  }
}
