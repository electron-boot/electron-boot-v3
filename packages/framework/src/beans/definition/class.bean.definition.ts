import { ObjectBeanDefinition } from './object.bean.definition';
import { Kind } from '../../enums/enums';
import { ClassCreatorDefinition } from './class.creator.definition';
import { ParametersDefinition } from './parameters.definition';
import { MethodsDefinition } from './methods.definition';
import { FieldsDefinition } from './fields.definition';
import { IClassBeanDefinition } from '../../interface/beans/definition/class.bean.definition';
import { IFieldsDefinition } from '../../interface/beans/definition/fields.definition';
import { IMethodsDefinition } from '../../interface/beans/definition/methods.definition';
import { IParametersDefinition } from '../../interface/beans/definition/parameters.definition';

export class ClassBeanDefinition extends ObjectBeanDefinition implements IClassBeanDefinition {
  kind: Kind.Class = Kind.Class;
  fields: IFieldsDefinition = new FieldsDefinition();
  methods: IMethodsDefinition = new MethodsDefinition();
  parameters: IParametersDefinition = new ParametersDefinition();
  creator: ClassCreatorDefinition = new ClassCreatorDefinition(this);
}
