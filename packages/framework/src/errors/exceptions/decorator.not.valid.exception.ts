import { RuntimeException } from './runtime.exception';

export class DecoratorNotValidException extends RuntimeException {
  constructor(message?: string) {
    super(`Decorators "${message}" are not valid here.`);
  }
}
