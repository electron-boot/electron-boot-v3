import { RuntimeException } from './runtime.exception';
import { SINGULAR_INJECT_REQUEST_MESSAGE } from '../message';

export class SingletonInjectRequestException extends RuntimeException {
  constructor(singletonScopeName: string, requestScopeName: string) {
    super(SINGULAR_INJECT_REQUEST_MESSAGE(singletonScopeName, requestScopeName));
  }
}
