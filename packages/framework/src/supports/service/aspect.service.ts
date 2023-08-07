import * as pm from 'picomatch';
import { Singleton } from '../../decorators/singleton.decorator';
import { IApplicationContext } from '../../interface/context.interface';
import { Autowired } from '../../decorators/autowired.decorator';
import { DecoratorName, DecoratorUtil } from '../../utils/decorator.util';
import { ClassType } from '../../interface/common.interface';
import { TypesUtil } from '../../utils/types.util';
import { AspectMetadata, IMethodAspect, JoinPoint } from '../../interface/support.interface';

@Singleton()
export class AspectService {
  @Autowired('rootContext')
  readonly applicationContext: IApplicationContext;

  /**
   * load aspect method for container
   */
  public async loadAspect() {
    // for aop implementation
    const aspectModules = DecoratorUtil.listModules(DecoratorName.ASPECT);
    // sort for aspect target
    let aspectDataList = [];
    for (const module of aspectModules) {
      const data = DecoratorUtil.getMetadata<Array<any>>(module, DecoratorName.ASPECT);
      aspectDataList = aspectDataList.concat(
        data.map(el => {
          el.aspectModule = module;
          return el;
        })
      );
    }

    // sort priority
    aspectDataList.sort((pre, next) => {
      return (next.priority || 0) - (pre.priority || 0);
    });

    for (const aspectData of aspectDataList) {
      // aspect instance init
      const aspectIns = await this.applicationContext.getAsync<IMethodAspect>(aspectData.aspectModule);
      await this.addAspect(aspectIns, aspectData);
    }
  }

  public async addAspect(aspectIns: IMethodAspect, aspectData: AspectMetadata) {
    const module = aspectData.aspectTarget;
    const names = Object.getOwnPropertyNames(module.prototype);
    const isMatch = aspectData.match ? (typeof aspectData.match === 'string' ? pm(aspectData.match) : aspectData.match) : () => true;

    for (const name of names) {
      if (name === 'constructor' || !isMatch(name)) {
        continue;
      }
      const descriptor = Object.getOwnPropertyDescriptor(module.prototype, name);
      if (!descriptor || descriptor.writable === false) {
        continue;
      }

      this.interceptPrototypeMethod(module, name, aspectIns);
    }
  }

  /**
   * intercept class method in prototype
   * @param Clz class you want to intercept
   * @param methodName method name you want to intercept
   * @param aspectObject aspect object, before, round, etc.
   */
  public interceptPrototypeMethod(Clz: ClassType, methodName: string | symbol, aspectObject: IMethodAspect | (() => IMethodAspect)) {
    const originMethod = Clz.prototype[methodName];

    if (TypesUtil.isAsyncFunction(Clz.prototype[methodName])) {
      Clz.prototype[methodName] = async function (...args: any[]) {
        let error: any, result: any;
        const newProceed = (...args: any[]) => {
          return originMethod.apply(this, args);
        };
        const joinPoint = {
          methodName,
          target: this,
          args: args,
          proceed: newProceed,
          proceedIsAsyncFunction: true,
        } as JoinPoint;

        if (typeof aspectObject === 'function') {
          aspectObject = aspectObject();
        }

        try {
          await aspectObject.before?.(joinPoint);
          if (aspectObject.around) {
            result = await aspectObject.around(joinPoint);
          } else {
            result = await originMethod.call(this, ...joinPoint.args);
          }
          joinPoint.proceed = undefined;
          const resultTemp = await aspectObject.afterReturn?.(joinPoint, result);
          result = typeof resultTemp === 'undefined' ? result : resultTemp;
          return result;
        } catch (err) {
          joinPoint.proceed = undefined;
          error = err;
          if (aspectObject.afterThrow) {
            await aspectObject.afterThrow(joinPoint, error);
          } else {
            throw err;
          }
        } finally {
          await aspectObject.after?.(joinPoint, result, error);
        }
      };
    } else {
      Clz.prototype[methodName] = function (...args) {
        let error, result;
        const newProceed = (...args) => {
          return originMethod.apply(this, args);
        };
        const joinPoint = {
          methodName,
          target: this,
          args: args,
          proceed: newProceed,
          proceedIsAsyncFunction: false,
        } as JoinPoint;

        if (typeof aspectObject === 'function') {
          aspectObject = aspectObject();
        }

        try {
          aspectObject.before?.(joinPoint);
          if (aspectObject.around) {
            result = aspectObject.around(joinPoint);
          } else {
            result = originMethod.call(this, ...joinPoint.args);
          }
          joinPoint.proceed = undefined;
          const resultTemp = aspectObject.afterReturn?.(joinPoint, result);
          result = typeof resultTemp === 'undefined' ? result : resultTemp;
          return result;
        } catch (err) {
          joinPoint.proceed = undefined;
          error = err;
          if (aspectObject.afterThrow) {
            aspectObject.afterThrow(joinPoint, error);
          } else {
            throw err;
          }
        } finally {
          aspectObject.after?.(joinPoint, result, error);
        }
      };
    }
  }
}