import { IMethodDefinition } from '../../interface/beans/definition/method.definition';
import { IParametersDefinition } from '../../interface/beans/definition/parameters.definition';
import { Identifier } from '../../interface/common';

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
