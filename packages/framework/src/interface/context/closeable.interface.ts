export interface ICloseable {
  close(): Promise<void> | void;
}
