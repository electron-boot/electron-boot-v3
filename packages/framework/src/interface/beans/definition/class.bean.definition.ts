import { Kind } from '../../../enums/enums';
import { IObjectBeanDefinition } from './object.bean.definition';
import { IFieldsDefinition } from './fields.definition';
import { IMethodsDefinition } from './methods.definition';
import { IParametersDefinition } from './parameters.definition';

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
