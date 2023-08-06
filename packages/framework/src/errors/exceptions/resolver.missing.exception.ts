import { RuntimeException } from './runtime.exception';

export class ResolverMissingException extends RuntimeException {
  constructor(type: string) {
    super(`Resolver "${type}" is missing.`);
  }
}
