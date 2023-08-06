import { Identifier } from './common.interface';
import { InjectMode, Kind, Scope } from '../enums/enums';
import { IApplicationContext } from './context.interface';

export interface IObjectBeanDefinition {
  /**
   * bean guid
   * @type {Identifier}
   * @memberOf IObjectBeanDefinition
   */
  id: string;
  /**
   * bean kind
   * @type {Kind}
   * @memberOf IObjectBeanDefinition
   */
  kind: Kind;
  /**
   * decorator context
   * @type {any}
   * @memberOf IObjectBeanDefinition
   */
  decoratorMetadataObject: DecoratorMetadataObject;
  /**
   * beans alias
   * @type {Identifier[]}
   * @memberOf IObjectBeanDefinition
   */
  alias: Identifier[];
  /**
   * beans name
   * @type {string}
   * @memberOf IObjectBeanDefinition
   */
  name: string;
  /**
   * bean origin name
   * @type {string}
   * @memberOf IObjectBeanDefinition
   */
  originName: string;
  /**
   * beans scope
   * @default Scope.Request
   * @see Scope
   * @memberOf IObjectBeanDefinition
   */
  scope: Scope;
  /**
   * beans target
   * @type {any}
   * @memberOf IObjectBeanDefinition
   */
  target: any;
  /**
   * beans specify export module
   * @type {string}
   * @memberOf IObjectBeanDefinition
   */
  export: string;
  /**
   * beans construct method name
   * @type {string}
   * @memberOf IObjectBeanDefinition
   */
  constructMethod: string;
  /**
   * beans initialization method name
   * @type {string}
   * @memberOf IObjectBeanDefinition
   */
  initMethod: string;
  /**
   * beans initialization method name
   * @type {string}
   * @memberOf IObjectBeanDefinition
   */
  destroyMethod: string;
  /**
   * bind definition callback
   * @param module
   * @param options
   * @memberOf IObjectBeanDefinition
   */
  bindHook?: (module: any, options: IObjectBeanDefinition) => void;
  /**
   * check definition is merge extends fields
   * @type {boolean}
   * @default false
   * @memberOf IObjectBeanDefinition
   */
  fieldsMerge?: boolean;
  /**
   * check definition can allow downgrade or not
   * @type {boolean}
   * @default false
   * @memberOf IObjectBeanDefinition
   */
  allowDowngrade?: boolean;
  /**
   * check if beans is singleton scope
   * @returns {boolean}
   * @memberOf IObjectBeanDefinition
   */
  isSingletonScope(): boolean;

  /**
   * check if beans is request scope
   * @returns {boolean}
   * @memberOf IObjectBeanDefinition
   */
  isRequestScope(): boolean;

  /**
   * save beans definition to target
   */
  save(): void;
  /**
   * beans creator
   * @type {IObjectCreatorDefinition}
   * @memberOf IObjectBeanDefinition
   */
  creator: IObjectCreatorDefinition;
}
export interface IFieldDefinition {
  /**
   * the field decorator name
   * @type string
   * @memberof IFieldDefinition
   */
  decorator: string | symbol;
  /**
   * the property key of field
   * @type {Identifier}
   * @memberof IFieldDefinition
   */
  propertyKey: Identifier;
  /**
   * the field metadata
   * @type {*}
   * @memberof IFieldDefinition
   */
  metadata: any;
  /**
   * the field impl or not
   * @type {boolean}
   * @memberof IFieldDefinition
   */
  impl?: boolean;
}
export interface IFieldsDefinition {
  setField(key: Identifier, definition: IFieldDefinition): this;
  getField(key: Identifier, defaultValue?: IFieldDefinition): IFieldDefinition;
  fieldKeys(): Identifier[];
}
export interface IParameterDefinition {
  /**
   * parameter provider
   * @type {Identifier}
   * @memberof IParameterDefinition
   */
  provider?: Identifier;
  /**
   * provider inject mode
   * @type {InjectMode}
   * @memberof IParameterDefinition
   */
  injectMode?: InjectMode;
  /**
   * Name of the method to which the parameter belongs
   * @type {Identifier}
   * @memberof IParameterDefinition
   */
  method: Identifier;
  /**
   * Index of the parameter in the method signature
   * @type {number}
   * @memberof IParameterDefinition
   */
  index: number;
}
export interface MethodDecoratorOptions {
  impl?: boolean;
}
export interface IMethodDefinition {
  /**
   * the field decorator name
   * @type string
   * @memberof IFieldDefinition
   */
  decorator: string | symbol;
  /**
   * The method max params number.
   * @export
   * @type {number}
   * @memberof IMethodDefinition
   */
  maxParams: number;
  /**
   * The method name.
   * @export
   * @type {Identifier}
   * @memberof IMethodDefinition
   */
  methodName: Identifier;
  /**
   * The method parameters.
   * @export
   * @type {Array<IParameterDefinition>}
   * @memberof IMethodDefinition
   */
  parameters: Array<IParameterDefinition>;
  /**
   * The method metadata.
   * @export
   * @type {*}
   * @memberof IMethodDefinition
   */
  metadata?: any;
  /**
   * The method impl or not
   * @type {boolean}
   * @memberof IMethodDefinition
   */
  options?: MethodDecoratorOptions;
}
export interface IMethodsDefinition {
  setMethod(name: Identifier, definition: IMethodDefinition): this;
  getMethod(name: Identifier, defaultValue?: IMethodDefinition): IMethodDefinition;
  methodKeys(): Identifier[];
}
export interface IParametersDefinition {
  setParameter(name: Identifier, definition: IMethodDefinition): this;
  getParameter(name: Identifier, defaultValue?: IMethodDefinition): IMethodDefinition;
  parameterKeys(): Identifier[];
}
export interface IClassBeanDefinition extends IObjectBeanDefinition {
  /**
   * the kind of beans
   * @type {Kind.Class}
   * @memberof IClassBeanDefinition
   */
  kind: Kind.Class;
  /**
   * the fields of beans definition
   * @type {IFieldsDefinition<F extends IFieldDefinition>}
   * @memberof IClassBeanDefinition
   */
  fields: IFieldsDefinition;
  /**
   * the methods of beans definition
   * @type {IMethodsDefinition<m extends IMethodDefinition>}
   * @memberof IClassBeanDefinition
   */
  methods: IMethodsDefinition;
  /**
   * the parameters of beans definition
   * @type {IParametersDefinition<p extends IParameterDefinition>}
   * @memberof IClassBeanDefinition
   */
  parameters: IParametersDefinition;
}
export interface IFactoryBeanDefinition extends IObjectBeanDefinition {
  kind: Kind.Factory;
}
export type BeanDefinition = IClassBeanDefinition | IFactoryBeanDefinition;
export interface IObjectCreatorDefinition {
  /**
   * load beans target
   */
  load(): any;

  /**
   * execute beans construction
   * @param clazz
   * @param args
   */
  doConstruct(clazz: any, args?: any[]): any;

  /**
   * execute beans construction async
   * @param clazz
   * @param args
   */
  doConstructAsync(clazz: any, args?: any[]): Promise<any>;

  /**
   * execute beans initialization
   * @param obj
   * @param args
   */
  doInit(obj: any, ...args: any[]): void;

  /**
   * execute beans initialization async
   * @param obj
   * @param args
   */
  doInitAsync(obj: any, ...args: any[]): Promise<void>;

  /**
   * execute beans destruction
   * @param obj
   * @param args
   */
  doDestroy(obj: any, ...args: any[]): void;

  /**
   * execute beans destruction async
   * @param obj
   * @param args
   */
  doDestroyAsync(obj: any, ...args: any[]): Promise<void>;
}
export interface GetOptions {
  originName?: string;
}
export interface IBeanFactory {
  get<T>(identifier: { new (...args: any[]): T }, args?: any[], objectContext?: GetOptions): T;
  get<T>(identifier: Identifier, args?: any[], objectContext?: GetOptions): T;
  getAsync<T>(identifier: { new (...args: any[]): T }, args?: any[], objectContext?: GetOptions): Promise<T>;
  getAsync<T>(identifier: Identifier, args?: any[], objectContext?: GetOptions): Promise<T>;
}
export interface IAliasRegistry {
  registerAlias(definition: IObjectBeanDefinition): void;
  removeAlias(identifier: Identifier): void;
  hasAlias(alias: Identifier): boolean;
  getAlias(alias: Identifier): Identifier;
  setAlias(alias: Identifier, identifier: Identifier): void;
  clearAll(): void;
}
export interface IBeanDefinitionRegistry {
  aliasRegistry: IAliasRegistry;
  registerDefinition(identifier: Identifier, definition: BeanDefinition): void;
  getSingletonDefinitionIds(): Identifier[];
  getDefinition(identifier: Identifier): BeanDefinition;
  getDefinitionSize(): number;
  getDefinitionByName(name: string): Identifier[];
  removeDefinition(identifier: Identifier): void;
  hasDefinition(identifier: Identifier): boolean;
  registerObject(identifier: Identifier, object: any): void;
  hasObject(identifier: Identifier): boolean;
  getObject(identifier: Identifier): any;
  getObjectSize(): number;
  clearAll(): void;
}
export interface FactoryInfoDefinition {
  identifier: Identifier;
  provider: (context: IApplicationContext, args?: any) => any;
  scope?: Scope;
}
