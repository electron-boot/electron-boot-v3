import { RuntimeException } from './runtime.exception';
import { USE_WRONG_METHOD_MESSAGE } from '../message';
import { Identifier } from '../../interface/common';

export class UseWrongMethodException extends RuntimeException {
  constructor(wrongMethod: string, replacedMethod: string, describeKey?: Identifier) {
    super(USE_WRONG_METHOD_MESSAGE(wrongMethod, replacedMethod, describeKey));
  }
}
