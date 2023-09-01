import { EventEmitter } from 'node:events';
import { Mode } from 'fs-extra';

export interface Options<T extends Record<string, any>> {
  /**
   * state file name
   * @default 'state'
   */
  name: string;
  /**
   * state file extension
   * @default 'data'
   */
  extension?: string;
  /**
   * state file mode
   * @default 0o666
   */
  mode?: Mode;
  /**
   * project name
   * @default app.getName()
   */
  projectName?: string;
  /**
   * file save current path
   * @default app.getPath('userData')
   */
  cwd?: string;
  /**
   * the state default values
   */
  defaults?: Readonly<T>;
  /**
   * if reading the state file causes a `SyntaxError`,clear state data
   * @default false
   */
  clearInvalid?: boolean;
  serialize?: Serialize<T>;
  deserialize?: Deserialize<T>;
  /**
   * encryption key
   */
  encryptionKey?: string;
  encryptData?: EncryptData;
  decryptData?: DecryptData;
}
export type OnChangeCallback<T> = (newValue: Readonly<T>, oldValue: Readonly<T>) => void;
export type Unsubscribe = () => EventEmitter;
export type Serialize<T> = (value: T) => string;
export type Deserialize<T> = (text: string) => T;
export type EncryptData = (data: string | Buffer) => string;
export type DecryptData = (data: string | Buffer) => string;
