import { Singleton } from '../../decorators/singleton.decorator';
import { Deserialize, OnChangeCallback, Options, Serialize, Unsubscribe } from '../../interface/support/service/state.interface';
import { Init } from '../../decorators';
import { EventEmitter } from 'node:events';
import * as crypto from 'node:crypto';
import * as path from 'node:path';
import { ILogger, LoggerFactory } from '@electron-boot/logger';
import { assign, get, isEqual, isUndefined, isNull, set, unset } from 'lodash';
import { app } from 'electron';
import { ConfigService } from './config.service';
import { outputFile, readFile, mkdirsSync } from 'fs-extra';

@Singleton()
export class StateService<T extends Record<string, any> = Record<string, unknown>> {
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
  configService: ConfigService;
  private readonly decryptData = (data: string | Buffer): string => {
    const encryptionKey = this.#encryptionKey;
    if (!encryptionKey) return data.toString();
    try {
      const initializationVector = data.slice(0, 16);
      const password = crypto.pbkdf2Sync(encryptionKey, initializationVector.toString(), 10_000, 32, 'sha512');
      const decipher = crypto.createDecipheriv(this.#encryptionAlgorithm, password, initializationVector);
      return Buffer.concat([decipher.update(Buffer.from(data.slice(17))), decipher.final()]).toString('utf8');
    } catch (e) {
      this.logger.warn(e);
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
    } catch (e) {
      this.logger.warn(e);
    }
    return data.toString();
  };

  private readonly deserialize: Deserialize<T> = value => JSON.parse(value);
  private readonly serialize: Serialize<T> = value => JSON.stringify(value, undefined, 2);
  constructor(configService: ConfigService) {
    this.configService = configService;
    this.#options = assign<Options<T>, Options<T>>(
      {
        name: 'state',
        projectName: app.getName(),
        extension: 'data',
        mode: 0o666,
        cwd: app.getPath('userData'),
      },
      this.configService.getConfiguration('state')
    );
    this.#defaultValue = assign<{}, T>({}, this.#options.defaults);
    this.#events = new EventEmitter();
    const fileExtension = this.#options.extension ? `.${this.#options.extension}` : '';
    this.#filename = path.resolve(this.#options.cwd, 'state', `${this.#options.name}${fileExtension}`);
    this.logger = LoggerFactory.getLogger(StateService.name + '#' + this.#options.name);
    if (this.#options.encryptionKey) this.#encryptionKey = this.#options.encryptionKey;
    if (this.#options.serialize) this.serialize = this.#options.serialize;
    if (this.#options.deserialize) this.deserialize = this.#options.deserialize;
    if (this.#options.encryptData) this.encryptData = this.#options.encryptData;
    if (this.#options.decryptData) this.decryptData = this.#options.decryptData;
  }

  @Init()
  async init(): Promise<void> {
    if (!this.initializing) {
      this.initializing = this.doInit();
    }
    return this.initializing;
  }

  private async doInit() {
    try {
      const data = await readFile(this.#filename, 'utf-8');
      const decryptData = this.decryptData(data);
      const deserializedData = this.deserialize(decryptData);
      this.#data = assign({}, this.#defaultValue, deserializedData);
    } catch (e) {
      if (e?.code === 'ENOENT') {
        this.ensureDirectory();
        this.#data = assign({}, this.#defaultValue);
        return;
      }
      this.logger.error(e);
    }
  }

  private ensureDirectory(): void {
    mkdirsSync(path.dirname(this.#filename));
  }

  private async save(): Promise<void> {
    if (!this.closing) return;

    return this.doSave();
  }

  private async doSave() {
    if (!this.initializing) return;

    // Waiting for initialization to complete
    await this.initializing;

    let encryptData: string;
    try {
      const serializedData = this.serialize(this.#data);
      encryptData = this.encryptData(serializedData);
      if (encryptData === this.#lastSavedData) {
        return;
      }
      await outputFile(this.#filename, encryptData, { mode: this.#options.mode });
      this.#events.emit('change');
    } catch (e) {
      this.logger.error(e);
    }
  }

  async close() {
    if (!this.closing) {
      this.closing = this.doSave();
    }
    return this.closing;
  }

  /**
   * Get an item
   * @param key - You can use see [lodash](https://www.lodashjs.com/docs/lodash.set)
   */
  get<Key extends keyof T>(key: Key): T[Key];
  /**
   * Get an item, if not set use defaultValue
   * @param key - You can use see [lodash](https://www.lodashjs.com/docs/lodash.set)
   * @param defaultValue - defaultValue
   */
  get<Key extends keyof T>(key: Key, defaultValue: Required<T>[Key]): Required<T>[Key];
  get<Key extends string, Value = unknown>(key: Exclude<Key, keyof T>, defaultValue?: Value): Value;
  get(key: string, defaultValue?: unknown): unknown {
    return get(this.#data, key, defaultValue);
  }

  /**
   * Set an item
   * @param key - You can use see [lodash](https://www.lodashjs.com/docs/lodash.set)
   * @param value - The value of this key, If not set, call delete(key)
   */
  set<Key extends keyof T>(key: Key, value?: T[Key]): void;
  /**
   * Set an item
   * @param key - You can use see [lodash](https://www.lodashjs.com/docs/lodash.set)
   * @param value - The value of this key, If not set, call delete(key)
   */
  set(key: string, value: unknown): void;
  /**
   * Set multiple items
   * @param object
   * @example
   * set({
   *  "a.b.c":"1",
   *  "a.e.f":"2"
   * })
   */
  set(object: Partial<T>): void;
  set<Key extends keyof T>(key: Partial<T> | Key | string, value?: T[Key] | unknown): void {
    if (typeof key !== 'string' && typeof key !== 'object') {
      throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof key}`);
    }
    if (typeof key === 'string') {
      const obj = { key: value };
      this.set(obj as any);
      return;
    }
    let save = false;
    const obj = key;
    for (const [key, value] of Object.entries(obj)) {
      const curValue = get(this.#data, key);
      if (isEqual(curValue, value)) {
        continue;
      }
      if (isUndefined(value) || isNull(value)) {
        if (!isUndefined(curValue)) {
          unset(this.#data, key);
          save = true;
        }
      } else {
        set(this.#data, key, value);
        save = true;
      }
    }
    if (save) {
      this.save();
    }
  }

  /**
   * Delete an item.
   *
   * @param key - The key of the item to delete.
   */
  delete<Key extends keyof T>(key: Key): void;
  delete(key: string): void {
    const curValue = get(this.#data, key);
    if (!isUndefined(curValue)) {
      unset(this.#data, key);
      this.save();
    }
  }

  /**
   * Delete all data
   *
   * This resets known items to their default values, if defined by the `defaults`
   */
  clear(): void {
    this.#data = assign({}, this.#defaultValue);
    this.save();
  }

  onChange(callback: OnChangeCallback<T>): Unsubscribe;
  onChange<Key extends keyof T>(key: Key, callback: OnChangeCallback<T[Key]>): Unsubscribe;
  onChange<Key extends string>(key: Key, callback: OnChangeCallback<unknown>): Unsubscribe;
  onChange(key: any, callback?: OnChangeCallback<any>): Unsubscribe {
    if (arguments.length <= 1) {
      callback = key;
      key = null;
    }
    if (typeof callback !== 'function') throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof callback}`);
    if (key) {
      return this.changeHandler(() => get(this.#data, key), callback);
    }
    return this.changeHandler(() => this.#data, callback);
  }

  private changeHandler<T>(getter: () => T | undefined, callback: OnChangeCallback<T>): Unsubscribe;
  private changeHandler<Key extends keyof T>(getter: () => T[Key] | undefined, callback: OnChangeCallback<T[Key]>): Unsubscribe;
  private changeHandler<Key extends keyof T>(getter: () => T | T[Key], callback: OnChangeCallback<T> | OnChangeCallback<T[Key]>): Unsubscribe {
    let currentValue = getter();
    const onChange = (): void => {
      const oldValue = currentValue;
      const newValue = getter();
      if (isEqual(newValue, oldValue)) {
        return;
      }
      currentValue = newValue;
      callback.call(this, newValue, oldValue);
    };
    this.#events.on('change', onChange);
    return () => this.#events.removeListener('change', onChange);
  }
}
