import { RuntimeException } from './runtime.exception';
import { Identifier } from '../../interface/common.interface';
import { USE_WRONG_METHOD_MESSAGE } from '../message';

export class UseWrongMethodException extends RuntimeException {
  constructor(wrongMethod: string, replacedMethod: string, describeKey?: Identifier) {
    super(USE_WRONG_METHOD_MESSAGE(wrongMethod, replacedMethod, describeKey));
  }
}
