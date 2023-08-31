import { EventEmitter } from 'node:events';
import { Deserialize, Options, Serialize } from './types';
import { assign } from 'lodash';
import { app } from 'electron';
import * as path from 'path';
import { readFile as atomReadFile, writeFile } from 'atomically';
import { outputFile, readFile } from 'fs-extra';
import process from 'process';
import crypto from 'node:crypto';
import { ILogger, LoggerFactory } from '@electron-boot/logger';
export class State<T extends Record<string, any> = Record<string, unknown>> {
  private logger: ILogger;
  readonly #encryptionAlgorithm = 'aes-256-cbc';
  private initializing: Promise<void> | undefined = undefined;
  private closing: Promise<void> | undefined = undefined;
  readonly #encryptionKey: string;
  readonly #events: EventEmitter;
  readonly #defaultValue: T;
  readonly #options: Options<T>;
  readonly #filename: string;
  #data: T;
  #lastSavedData: string;
  private readonly decryptData = (data: string | Buffer): string => {
    const encryptionKey = this.#encryptionKey;
    if (!encryptionKey) return data.toString();
    // Check if an initialization vector has been used to encrypt the data.
    try {
      const initializationVector = data.slice(0, 16);
      const password = crypto.pbkdf2Sync(encryptionKey, initializationVector.toString(), 10_000, 32, 'sha512');
      const decipher = crypto.createDecipheriv(this.#encryptionAlgorithm, password, initializationVector);
      return Buffer.concat([decipher.update(Buffer.from(data.slice(17))), decipher.final()]).toString('utf8');
    } catch {
      /* empty */
    }
    return data.toString();
  };

  private readonly encryptData = (data: string | Buffer): string => {
    const encryptionKey = this.#encryptionKey;
    if (!encryptionKey) return data.toString();
    try {
      const initializationVector = crypto.randomBytes(16);
      const password = crypto.pbkdf2Sync(encryptionKey, initializationVector.toString(), 10_000, 32, 'sha512');
      const cipher = crypto.createCipheriv(this.#encryptionAlgorithm, password, initializationVector);
      return Buffer.concat([initializationVector, Buffer.from(':'), cipher.update(Buffer.from(data)), cipher.final()]).toString('utf-8');
    } catch {
      /* empty */
    }
    return data.toString();
  };

  private readonly deserialize: Deserialize<T> = value => JSON.parse(value);
  private readonly serialize: Serialize<T> = value => JSON.stringify(value, undefined, 2);
  constructor(options: Readonly<Options<T>>) {
    this.#options = assign<Options<T>, Options<T>>(
      {
        name: 'state',
        projectName: app.getName(),
        extension: 'data',
        mode: 0o666,
        cwd: app.getPath('userData'),
      },
      options
    );
    this.#defaultValue = assign<{}, T>({}, this.#options.defaults);
    this.#events = new EventEmitter();
    const fileExtension = this.#options.extension ? `.${this.#options.extension}` : '';
    this.#filename = path.resolve(this.#options.cwd, '.' + this.#options.projectName, `${this.#options.name}${fileExtension}`);
    this.logger = LoggerFactory.getLogger(State.name + '#' + this.#options.name);
    if (this.#options.encryptionKey) this.#encryptionKey = this.#options.encryptionKey;
    if (this.#options.serialize) this.serialize = this.#options.serialize;
    if (this.#options.deserialize) this.deserialize = this.#options.deserialize;
    if (this.#options.encryptData) this.encryptData = this.#options.encryptData;
    if (this.#options.decryptData) this.decryptData = this.#options.decryptData;
  }

  init(): Promise<void> {
    if (!this.initializing) {
      this.initializing = this.doInit();
    }
    return this.initializing;
  }

  private async doInit() {
    let data: string | Buffer | PromiseLike<string | Buffer>;
    try {
      if (process.env.SNAP) {
        data = await readFile(this.#filename, 'utf-8');
      } else {
        data = await atomReadFile(this.#filename, {
          encoding: 'utf-8',
        });
      }
      const decryptData = this.decryptData(data);
      const deserializedData = this.deserialize(decryptData);
      this.#data = assign({}, deserializedData);
    } catch (e) {
      this.logger.error(e);
    }
  }

  private async save(): Promise<void> {
    if (!this.closing) return;

    return this.doSave();
  }

  private async doSave() {
    if (!this.initializing) return;

    await this.initializing;
    let serializedData: string;
    let encryptData: string;
    try {
      serializedData = this.serialize(this.#data);
      encryptData = this.encryptData(serializedData);
      if (encryptData === this.#lastSavedData) {
        return;
      }
      if (process.env.SNAP) {
        await outputFile(this.#filename, encryptData, { mode: this.#options.mode });
      } else {
        await writeFile(this.#filename, encryptData, {
          mode: this.#options.mode,
        });
      }
    } catch (e) {
      if (e?.code === 'EXDEV') {
        return await outputFile(this.#filename, encryptData, {
          mode: this.#options.mode,
        });
      }
      this.logger.error(e);
    } finally {
      this.#events.emit('change');
    }
  }

  // private async save(): Promise<void> {
  //   if (this.closing) return;
  //   return this.doSave();
  // }
  //
  // private async doSave(): Promise<void> {
  //   if (!this.initializing) {
  //     return;
  //   }
  //   await this.initializing;
  //   if (isEqual(this.#data, this.#lastSavedData)) {
  //     return;
  //   }
  //   // write
  //   try {
  //     this.#adapter.write(this.#data)
  //   }
  // }
  //
  // async close() {
  //   this.clse;
  // }
  //
  // /**
  //  * get value by key
  //  * @param key
  //  */
  // async get<Key extends keyof T>(key: Key): Promise<T[Key]>;
  // /**
  //  * get value by key, if not use defaultValue
  //  * @param key
  //  * @param defaultValue
  //  */
  // async get<Key extends keyof T>(key: Key, defaultValue: Required<T>[Key]): Promise<Required<T>[Key]>;
  // async get<Key extends string, Value = unknown>(key: Exclude<Key, keyof T>, defaultValue?: Value): Promise<Value>;
  // async get(key: string, defaultValue?: unknown): Promise<unknown> {
  //   await this.init();
  //   return get(this.#data, key, defaultValue);
  // }
  //
  // /**
  //  * Set an item
  //  * @param key {string}
  //  * @param value {object}
  //  */
  // async set<Key extends keyof T>(key: Key, value?: T[Key]): Promise<void>;
  // /**
  //  * Set an item
  //  * @param key {string}
  //  * @param value {any}
  //  */
  // async set(key: string, value: unknown): Promise<void>;
  // /**
  //  * Set multiple items
  //  * @param object
  //  */
  // async set(object: Partial<T>): Promise<void>;
  // async set<Key extends keyof T>(key: Partial<T> | Key | string, value?: T[Key] | unknown): Promise<void> {
  //   await this.init();
  //   if (typeof key !== 'string' && typeof key !== 'object') {
  //     throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof key}`);
  //   }
  //   if (typeof key !== 'object' && value === undefined) {
  //     throw new TypeError('Use `delete()` to clear values');
  //   }
  //   if (typeof key === 'object') {
  //     const obj = key;
  //     for (const [key, value] of Object.entries(obj)) {
  //       set(this.#data, key, value);
  //     }
  //   } else {
  //     set(this.#data, key, value);
  //   }
  //   await this.write();
  // }
  //
  // /**
  //  * Check if an item exists.
  //  * @param key - The key of the item to check.
  //  */
  // has<Key extends keyof T>(key: Key | string): boolean {
  //   return hasIn(this.#data, key);
  // }
  //
  // onChange(callback: OnChangeCallback<T>): Unsubscribe;
  // onChange<Key extends keyof T>(key: Key, callback: OnChangeCallback<T[Key]>): Unsubscribe;
  // onChange<Key extends string>(key: Key, callback: OnChangeCallback<unknown>): Unsubscribe;
  // onChange(key: any, callback?: OnChangeCallback<any>): Unsubscribe {
  //   if (arguments.length <= 1) {
  //     callback = key;
  //     key = null;
  //   }
  //   if (typeof callback !== 'function') throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof callback}`);
  //   if (key) {
  //     return this.changeHandler(() => get(this.#data, key), callback);
  //   }
  //   return this.changeHandler(() => this.#data, callback);
  // }
  //
  // private changeHandler<T>(getter: () => T | undefined, callback: OnChangeCallback<T>): Unsubscribe;
  // private changeHandler<Key extends keyof T>(getter: () => T[Key] | undefined, callback: OnChangeCallback<T[Key]>): Unsubscribe;
  // private changeHandler<Key extends keyof T>(getter: () => T | T[Key], callback: OnChangeCallback<T> | OnChangeCallback<T[Key]>): Unsubscribe {
  //   let currentValue = getter();
  //   const onChange = (): void => {
  //     const oldValue = currentValue;
  //     const newValue = getter();
  //     if (isDeepStrictEqual(newValue, oldValue)) {
  //       return;
  //     }
  //     currentValue = newValue;
  //     callback.call(this, newValue, oldValue);
  //   };
  //   this.#events.on('change', onChange);
  //   return () => this.#events.removeListener('change', onChange);
  // }
}
