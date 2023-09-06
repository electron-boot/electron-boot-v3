import { Singleton } from '../../decorators/singleton.decorator';
import { DynamicEventInfo, EventInfo } from '../../interface/support/service/event.interface';
import { DecoratorName, DecoratorManager } from '../../decorators/decorator.manager';
import { ControllerMetadata, ActionMetadata } from '../../interface/decorator/metadata.interface';
import { ILogger, LoggerFactory } from '@electron-boot/logger';
import { DuplicateEventException } from '../../errors/exceptions/duplicate.router.exception';
import { kebabCase } from 'lodash-es';

@Singleton()
export class EventService {
  private isReady = false;
  private eventMap = new Map<string, EventInfo>();
  private logger: ILogger = LoggerFactory.getLogger(EventService);

  constructor() {}
  /**
   * 初始化
   * @private
   */
  private async analyze() {
    // 获取所有的controller模块
    const controllerModules = DecoratorManager.listModules(DecoratorName.CONTROLLER);
    for (const module of controllerModules) {
      // 控制器参数
      const controllerOption: ControllerMetadata = DecoratorManager.getMetadata(module, DecoratorName.CONTROLLER);
      // 添加控制器
      this.addController(module, controllerOption);
    }
  }

  /**
   * 添加控制器
   * @param controllerClazz 控制器实例
   * @param controllerMetadata
   */
  public addController(controllerClazz: any, controllerMetadata: ControllerMetadata) {
    const beanDefinition = DecoratorManager.getBeanDefinition(controllerClazz);
    const id = beanDefinition.id;
    /**
     * 所有的路由参数列表
     */
    const actions: ActionMetadata[] = DecoratorManager.getMetadata(controllerClazz, DecoratorName.ACTION);
    /**
     * 如果routerInfos有数据
     */
    if (actions && typeof actions[Symbol.iterator] === 'function') {
      for (const action of actions) {
        const eventName = [
          controllerMetadata.customName ?? kebabCase(controllerMetadata.controllerName),
          action.customName ?? kebabCase(action.actionName),
        ].join('/');
        // 路由信息
        const data: EventInfo = {
          id,
          eventName: `/${eventName}`,
          handlerName: `${controllerMetadata.controllerName}.${action.actionName}`,
          method: action.actionName,
        };
        this.checkDuplicateAndPush(data.eventName, data);
      }
    }
  }

  /**
   * 添加路由
   * @param path
   * @param routerFunction
   * @param routerInfoOption
   */
  public addRouter(path: string, routerFunction: (...args) => void, routerInfoOption: DynamicEventInfo) {
    this.checkDuplicateAndPush(
      '/',
      Object.assign(routerInfoOption, {
        method: routerFunction,
        url: path,
      })
    );
  }

  /**
   * get event list
   */
  public async getEventList(): Promise<Map<string, EventInfo>> {
    if (!this.isReady) {
      await this.analyze();
      this.isReady = true;
    }
    return this.eventMap;
  }

  /**
   * check duplicate and push
   * @param event
   * @param eventInfo
   * @private
   */
  private checkDuplicateAndPush(event: string, eventInfo: EventInfo) {
    if (this.eventMap.has(event)) {
      throw new DuplicateEventException(event, this.eventMap.get(event).handlerName, eventInfo.handlerName);
    }
    this.eventMap.set(event, eventInfo);
  }
}
