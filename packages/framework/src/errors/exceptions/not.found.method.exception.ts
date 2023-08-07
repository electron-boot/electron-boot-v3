import { RuntimeException } from './runtime.exception';
import { NOT_FOUND_MESSAGE } from '../message';
import { Identifier } from '../../interface/common';

export class NotFoundMethodException extends RuntimeException {
  constructor(identifier: Identifier) {
    super(NOT_FOUND_MESSAGE(identifier));
  }
}
