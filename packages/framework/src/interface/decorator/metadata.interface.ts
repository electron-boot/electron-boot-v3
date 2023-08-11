import { InjectMode } from '../../enums/enums';
import { ClassType, Identifier, Type } from '../common';
export interface FieldAccessMetadata<This = unknown, Value = unknown> {
  /**
   * Determines whether an object has a property with the same name as the decorated element.
   */
  has(object: This): boolean;

  /**
   * Gets the value of the field on the provided object.
   */
  get(object: This): Value;

  /**
   * Sets the value of the field on the provided object.
   */
  set(object: This, value: Value): void;
}
/**
 * autowired field metadata
 */
export interface AutowiredFieldMetadata {
  /**
   * private field or not
   * @type {boolean}
   * @memberof AutowiredFieldMetadata
   */
  private?: boolean;
  /**
   * static field or not
   * @type {boolean}
   * @memberof AutowiredFieldMetadata
   */
  static?: boolean;
  /**
   * context access
   * @type {FieldAccessMetadata}
   * @memberof AutowiredFieldMetadata
   */
  access?: FieldAccessMetadata;
  /**
   * the filed type string
   * @type string
   * @memberof AutowiredFieldMetadata
   */
  type?: string;
  /**
   * the provider of field
   * @type {*}
   * @memberof AutowiredFieldMetadata
   */
  provider: any;
  /**
   * the inject mode of field
   * @type {InjectMode}
   * @memberof AutowiredFieldMetadata
   */
  injectMode: InjectMode;
}
/**
 * provider
 */
export type Provider<T = any> = ClassType<T> | ClassProvider<T> | ValueProvider | FactoryProvider;
/**
 * class provider
 */
export interface ClassProvider<T = any> {
  identifier: Identifier;
  class: Type<T>;
}

/**
 * value provider
 */
export interface ValueProvider {
  identifier: Identifier;
  value: any;
}

/**
 * factory provider
 */
export interface FactoryProvider<T = any> {
  identifier: Identifier;
  factory: (...args: any[]) => T | Promise<T>;
}

/**
 * module metadata
 */
export interface ModuleMetadata<T = any> {
  /**
   * import extend ayn
   */
  imports?: Array<Type<T> | DynamicModule | Promise<DynamicModule>>;
  /**
   * this module providers
   */
  providers?: Array<Provider<T>>;
  /**
   * import configs
   */
  configs?: Array<{ [environmentName: string]: Record<string, any> }> | Record<string, any>;
  /**
   * config filter
   * @param config
   */
  configFilter?: (config: Record<string, any>) => Record<string, any>;
}

/**
 * dynamic module
 */
export interface DynamicModule extends ModuleMetadata {
  /**
   * module class
   */
  module: Type;
}

export interface ControllerMetadata {
  /**
   * controller class name
   */
  controllerName: string;
  /**
   * controller custom name
   */
  customName?: string;
}

export interface ActionMetadata {
  /**
   * action name
   */
  actionName: string;
  /**
   * action method name
   */
  customName?: string;
}
