import { RuntimeException } from './runtime.exception';
import { MISSING_IMPORT_MESSAGE } from '../message';
import { Identifier } from '../../interface/common';

export class MissingImportException extends RuntimeException {
  constructor(originName: Identifier) {
    super(MISSING_IMPORT_MESSAGE(originName));
  }
}
