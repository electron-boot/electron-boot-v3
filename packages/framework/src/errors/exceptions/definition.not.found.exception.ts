import { RuntimeException } from './runtime.exception';
import { Identifier } from '../../interface/common.interface';

export class DefinitionNotFoundException extends RuntimeException {
  static readonly type = Symbol.for('#NotFoundError');
  static isClosePrototypeOf(ins: DefinitionNotFoundException): boolean {
    return ins ? ins[DefinitionNotFoundException.type] === DefinitionNotFoundException.type : false;
  }
  constructor(identifier: Identifier) {
    super(`${identifier.toString()} is not valid in current context`);
    this[DefinitionNotFoundException.type] = DefinitionNotFoundException.type;
  }
  updateErrorMsg(className: string): void {
    const identifier = this.message.split(' is not valid in current context')[0];
    this.message = `${identifier} in class ${className} is not valid in current context`;
  }
}
