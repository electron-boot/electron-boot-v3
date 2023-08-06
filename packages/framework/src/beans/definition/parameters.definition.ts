import { Identifier } from '../../interface/common.interface';
import { IMethodDefinition, IParametersDefinition } from '../../interface/beans.interface';

export class ParametersDefinition extends Map<Identifier, any> implements IParametersDefinition {
  getParameter(name: Identifier, defaultValue?: IMethodDefinition): IMethodDefinition {
    if (this.has(name)) {
      return this.get(name);
    }
    return defaultValue;
  }

  parameterKeys(): Identifier[] {
    return Array.from(this.keys());
  }

  setParameter(name: Identifier, definition: IMethodDefinition): this {
    return this.set(name, definition);
  }
}
