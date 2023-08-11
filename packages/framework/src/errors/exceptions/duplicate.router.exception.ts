import { RuntimeException } from './runtime.exception';

export class DuplicateEventException extends RuntimeException {
  constructor(eventName: string, existPos: string, existPosOther: string) {
    super(`Duplicate event "${eventName}" at "${existPos}" and "${existPosOther}"`);
  }
}
