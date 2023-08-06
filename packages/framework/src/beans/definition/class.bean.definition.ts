import { ObjectBeanDefinition } from './object.bean.definition';
import { IClassBeanDefinition, IFieldsDefinition, IMethodsDefinition, IParametersDefinition } from '../../interface/beans.interface';
import { Kind } from '../../enums/enums';
import { ClassCreatorDefinition } from './class.creator.definition';
import { ParametersDefinition } from './parameters.definition';
import { MethodsDefinition } from './methods.definition';
import { FieldsDefinition } from './fields.definition';

export class ClassBeanDefinition extends ObjectBeanDefinition implements IClassBeanDefinition {
  kind: Kind.Class = Kind.Class;
  fields: IFieldsDefinition = new FieldsDefinition();
  methods: IMethodsDefinition = new MethodsDefinition();
  parameters: IParametersDefinition = new ParametersDefinition();
  creator: ClassCreatorDefinition = new ClassCreatorDefinition(this);
}
