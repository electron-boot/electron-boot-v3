import { IObjectBeanDefinition } from '../beans';
import { IApplicationContext } from './application.context.interface';

export interface IObjectLifecycle {
  onBeforeBind(
    fn: (
      clazz: any,
      options: {
        context: IApplicationContext;
        definition: IObjectBeanDefinition;
        replaceCallback: (newDefinition: IObjectBeanDefinition) => void;
      }
    ) => void
  ): void;
  onBeforeObjectCreated(
    fn: (
      Clzz: any,
      options: {
        context: IApplicationContext;
        definition: IObjectBeanDefinition;
        constructorArgs: any[];
      }
    ) => void
  ): void;
  onObjectCreated<T>(
    fn: (
      ins: T,
      options: {
        context: IApplicationContext;
        definition: IObjectBeanDefinition;
        replaceCallback: (ins: T) => void;
      }
    ) => void
  ): void;
  onObjectInit<T>(
    fn: (
      ins: T,
      options: {
        context: IApplicationContext;
        definition: IObjectBeanDefinition;
      }
    ) => void
  ): void;
  onBeforeObjectDestroy<T>(
    fn: (
      ins: T,
      options: {
        context: IApplicationContext;
        definition: IObjectBeanDefinition;
      }
    ) => void
  ): void;
}
