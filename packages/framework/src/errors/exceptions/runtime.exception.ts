export class RuntimeException extends Error {
  name: string;
  cause: Error;
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;
  }
  json(): string {
    return JSON.stringify({
      name: this.name,
      cause: this.cause,
    });
  }
}
