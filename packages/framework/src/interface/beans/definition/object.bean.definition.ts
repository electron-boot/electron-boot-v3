import { Kind, Scope } from '../../../enums/enums';
import { Identifier } from '../../common';
import { IObjectCreatorDefinition } from './object.creator.definition';

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
