import { Singleton } from '../../decorators/singleton.decorator';
import { ILogger, LoggerFactory } from '@electron-boot/logger';
import { Init } from '../../decorators/definition.decorator';
import { Autowired } from '../../decorators/autowired.decorator';
import { DecoratorName, DecoratorManager } from '../../decorators/decorator.manager';
import { RuntimeException } from '../../errors/exceptions/runtime.exception';
import { AspectService } from './aspect.service';
import { HandlerFunction, MethodHandlerFunction } from '../../interface/support/support.interface';
import { ClassType } from '../../interface/common';
import { IClassBeanDefinition } from '../../interface/beans/definition/class.bean.definition';
import { IFieldDefinition } from '../../interface/beans/definition/field.definition';
import { IApplicationContext } from '../../interface/context/application.context.interface';
@Singleton()
export class DecoratorService {
  private propertyHandlerMap = new Map<string | symbol, HandlerFunction>();
  private methodDecoratorMap: Map<string | symbol, (...args: any[]) => any> = new Map();
  private logger: ILogger = LoggerFactory.getLogger(DecoratorService);
  @Autowired()
  private aspectService: AspectService;

  @Autowired('rootContext')
  readonly applicationContext: IApplicationContext;

  @Init()
  protected init() {
    // add custom method decorator listener
    this.applicationContext.onBeforeBind(clazz => {
      const beanDefinition = DecoratorManager.getBeanDefinition<IClassBeanDefinition>(clazz);
      if (beanDefinition && beanDefinition.methods) {
        // loop it, save this order for decorator run
        for (const methodKey of beanDefinition.methods.methodKeys()) {
          const meta = beanDefinition.methods.getMethod(methodKey);
          const { methodName, decorator, metadata, options } = meta;
          if (!options || !options.impl) {
            continue;
          }
          // add aspect implementation first
          this.aspectService.interceptPrototypeMethod(clazz, methodName, () => {
            const methodDecoratorHandler = this.methodDecoratorMap.get(decorator);
            if (!methodDecoratorHandler) {
              throw new RuntimeException(`Method Decorator "${decorator.toString()}" handler not found, please register first.`);
            }
            return this.methodDecoratorMap.get(decorator)({
              target: clazz,
              methodName,
              metadata,
            });
          });
        }
      }
    });

    // add custom property decorator listener
    this.applicationContext.onObjectCreated((instance: ClassType, options) => {
      const definition = options.definition as IClassBeanDefinition;
      if (this.propertyHandlerMap.size > 0 && definition.fields) {
        for (const key of definition.fields.fieldKeys()) {
          const field = definition.fields.getField(key);
          if (field.decorator === DecoratorName.AUTOWIRED) continue;
          this.defineGetterPropertyValue(field, instance, this.getHandler(field.decorator));
        }
      }
    });

    // register @ApplicationContext
    this.registerPropertyHandler(DecoratorName.APPLICATION_CONTEXT, () => {
      return this.applicationContext;
    });
  }

  public registerPropertyHandler(decoratorKey: string | symbol, fn: HandlerFunction) {
    this.logger.debug('[core]: Register property decorator key="%s"', decoratorKey);
    this.propertyHandlerMap.set(decoratorKey, fn);
  }

  public registerMethodHandler(decoratorKey: string | symbol, fn: MethodHandlerFunction) {
    this.logger.debug('[core]: Register method decorator key=%s', decoratorKey);
    this.methodDecoratorMap.set(decoratorKey, fn);
  }

  /**
   * binding getter method for decorator
   *
   * @param prop
   * @param instance
   * @param getterHandler
   */
  private defineGetterPropertyValue(prop: IFieldDefinition, instance: ClassType, getterHandler: HandlerFunction) {
    if (prop && getterHandler) {
      if (prop.propertyKey) {
        Object.defineProperty(instance, prop.propertyKey, {
          get: () => getterHandler(prop.propertyKey, prop.metadata ?? {}, instance),
          configurable: true,
          enumerable: true,
        });
      }
    }
  }

  private getHandler(key: string | symbol) {
    if (this.propertyHandlerMap.has(key)) {
      return this.propertyHandlerMap.get(key);
    }
  }
}
