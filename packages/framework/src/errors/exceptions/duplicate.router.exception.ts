import { RuntimeException } from './runtime.exception';

export class DuplicateRouteException extends RuntimeException {
  constructor(routerUrl: string, existPos: string, existPosOther: string) {
    super(`Duplicate router "${routerUrl}" at "${existPos}" and "${existPosOther}"`);
  }
}
