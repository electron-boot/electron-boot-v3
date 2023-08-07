import { ClassFieldDecoratorFunction, ClassMethodDecoratorFunction, ProviderIdentifier } from '../interface/decorator/decorators.interface';
import { DecoratorName, DecoratorUtil } from '../utils/decorator.util';
import { DecoratorNotValidException } from '../errors/exceptions/decorator.not.valid.exception';
import { AutowiredFieldMetadata } from '../interface/decorator/metadata.interface';
import { TypesUtil } from '../utils/types.util';
import { InjectMode } from '../enums/enums';
import { IFieldDefinition } from '../interface/beans/definition/field.definition';
export interface AutowiredOptions {
  /**
   * The provider of the provider to Autowired.
   * @type {ProviderIdentifier}
   * @memberof AutowiredOptions
   */
  provider: ProviderIdentifier;
  /**
   * The identifiers of the providers to Autowired.
   * @type {ProviderIdentifier[]}
   */
  providers: ProviderIdentifier[];
}
export interface AutowiredDecorator {
  /**
   * autowired decorator
   * @export
   * @example
   * ```typescript
   * @Autowired()
   * userService: UserService;
   * @param provider
   */
  (provider: ProviderIdentifier): ClassFieldDecoratorFunction<any, any, any>;

  /**
   * autowired decorator
   * @param providers
   * @example
   * ```typescript
   * export class Animal {
   *    @Autowired([DogService, CatService])
   *    say(dogService: DogService, catService: CatService){
   *      dogService.say();
   *      catService.say();
   *    }
   * }
   */
  (providers: ProviderIdentifier[]): ClassMethodDecoratorFunction<any, any, any>;
  /**
   * autowired decorator
   * @param metadata
   * @example
   * ```typescript
   * @Autowired({
   *   identifier: UserService
   * })
   * userService: UserService;
   */
  (metadata?: Pick<AutowiredOptions, 'provider'>): ClassFieldDecoratorFunction<any, any, any>;
  /**
   * autowired decorator
   * @param target
   * @param context
   * @example
   * ```typescript
   * @Autowired
   * userService: UserService;
   */
  (target: any, context: ClassFieldDecoratorContext): void;
}
export const Autowired: AutowiredDecorator = DecoratorUtil.createDecorator((target: any, context: DecoratorContext, provider: any) => {
  switch (context.kind) {
    case 'field':
      saveAutowiredField(context, {
        decorator: DecoratorName.AUTOWIRED,
        propertyKey: context.name,
        metadata: <AutowiredFieldMetadata>{
          provider: provider,
          injectMode: InjectMode.Identifier,
        },
      });
      break;
    case 'method':
      console.log('注入method');
      break;
    default:
      throw new DecoratorNotValidException('Autowired');
  }
});
export const saveAutowiredField = (context: ClassFieldDecoratorContext, metadata: IFieldDefinition) => {
  const beanDefinition = DecoratorUtil.getBeanDefinition(context, DecoratorUtil.classBeanDefinition(context));
  const fieldDefinition = beanDefinition.fields.getField(context.name, metadata);
  fieldDefinition.metadata.static = context.static;
  fieldDefinition.metadata.private = context.private;
  fieldDefinition.metadata.access = context.access;
  if (fieldDefinition.metadata.provider) {
    if (!TypesUtil.isPrimitiveType(fieldDefinition.metadata.provider) && DecoratorUtil.isProvider(fieldDefinition.metadata.provider)) {
      fieldDefinition.metadata.provider = DecoratorUtil.getBeanDefinition(fieldDefinition.metadata.provider).id;
      fieldDefinition.metadata.injectMode = InjectMode.Class;
    }
  } else {
    fieldDefinition.metadata.provider = context.name;
    fieldDefinition.metadata.injectMode = InjectMode.PropertyKey;
  }
  beanDefinition.fields.setField(context.name, fieldDefinition);
  beanDefinition.save();
};
