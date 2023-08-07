import { Singleton } from '../../decorators/singleton.decorator';
import { DynamicRouterInfo, RouterInfo, RouterPriority } from '../../interface/support/service/router.interface';
import { DecoratorName, DecoratorUtil } from '../../utils/decorator.util';
import { ControllerOption, RouterOption } from '../../interface/decorator/metadata.interface';
import { ILogger, LoggerFactory } from '@electron-boot/logger';
import { RuntimeException } from '../../errors/exceptions/runtime.exception';
import { TypesUtil } from '../../utils/types.util';
import { DuplicateRouteException } from '../../errors/exceptions/duplicate.router.exception';

@Singleton()
export class RouterService {
  private isReady = false;
  private routers = new Map<string, RouterInfo[]>();
  private logger: ILogger = LoggerFactory.getLogger(RouterService);
  private routersPriority: RouterPriority[] = [];

  /**
   * 构造函数
   */
  constructor() {}
  /**
   * 初始化
   * @private
   */
  private async analyze() {
    // 获取所有的controller模块
    const controllerModules = DecoratorUtil.listModules(DecoratorName.CONTROLLER);
    for (const module of controllerModules) {
      // 控制器参数
      const controllerOption: ControllerOption = DecoratorUtil.getMetadata(module, DecoratorName.CONTROLLER);
      // 添加控制器
      this.addController(module, controllerOption);
    }

    // 过滤掉空的前缀
    this.routersPriority = this.routersPriority.filter(item => {
      const prefixList = this.routers.get(item.prefix);
      if (prefixList.length > 0) {
        return true;
      } else {
        this.routers.delete(item.prefix);
        return false;
      }
    });

    // 路由排序
    for (const prefix of this.routers.keys()) {
      const routerInfo = this.routers.get(prefix);
      this.routers.set(prefix, this.sortRouter(routerInfo));
    }

    // 前缀排序
    this.routersPriority = this.routersPriority.sort((routeA, routeB) => {
      return routeB.prefix.length - routeA.prefix.length;
    });
  }

  /**
   * 添加控制器
   * @param controllerClazz 控制器实例
   * @param controllerOption 控制器参数
   */
  public addController(controllerClazz: any, controllerOption: ControllerOption) {
    const beanDefinition = DecoratorUtil.getBeanDefinition(controllerClazz);
    const controllerId = beanDefinition.name;
    this.logger.debug(`[core]: Found controller ${controllerId}`);
    const id = beanDefinition.id;
    // 定义优先级
    let priority: number;
    // 前缀
    const prefix = controllerOption.prefix || '/';
    // 配置*
    if (/\*/.test(prefix)) {
      throw new RuntimeException(`Router prefix ${prefix} can't set string with *`);
    }
    // 设置前缀
    if (!this.routers.has(prefix)) {
      this.routers.set(prefix, []);
      this.routersPriority.push({
        middleware: [],
        prefix,
        priority: prefix === '/' && priority === undefined ? -999 : 0,
        routerOptions: controllerOption.routerOptions,
        controllerId,
        routerModule: controllerClazz,
      });
    }
    /**
     * 所有的路由参数列表
     */
    const routerInfos: RouterOption[] = DecoratorUtil.getMetadata(controllerClazz, DecoratorName.ACTION);
    /**
     * 如果routerInfos有数据
     */
    if (routerInfos && typeof routerInfos[Symbol.iterator] === 'function') {
      for (const routerInfo of routerInfos) {
        // 路由信息
        const data: RouterInfo = {
          id,
          prefix: prefix,
          routerName: routerInfo.routerName || '',
          url: routerInfo.path,
          method: routerInfo.method,
          handlerName: `${controllerId}.${routerInfo.method}`,
          funcHandlerName: `${controllerId}.${routerInfo.method}`,
          controllerId,
        };
        this.checkDuplicateAndPush(data.prefix, data);
      }
    }
  }

  /**
   * 添加路由
   * @param path
   * @param routerFunction
   * @param routerInfoOption
   */
  public addRouter(path: string, routerFunction: (...args) => void, routerInfoOption: DynamicRouterInfo) {
    this.checkDuplicateAndPush(
      '/',
      Object.assign(routerInfoOption, {
        method: routerFunction,
        url: path,
      })
    );
  }

  /**
   * 路由排序
   * @param urlMatchList
   */
  public sortRouter(urlMatchList: RouterInfo[]) {
    // 1. 绝对路径规则优先级最高如 /ab/cb/e
    // 2. 星号只能出现最后且必须在/后面，如 /ab/cb/**
    // 3. 如果绝对路径和通配都能匹配一个路径时，绝对规则优先级高
    // 4. 有多个通配能匹配一个路径时，最长的规则匹配，如 /ab/** 和 /ab/cd/** 在匹配 /ab/cd/f 时命中 /ab/cd/**
    // 5. 如果 / 与 /* 都能匹配 / ,但 / 的优先级高于 /*
    return urlMatchList
      .map(item => {
        const urlString = item.url.toString();
        const weightArr = TypesUtil.isRegExp(item.url) ? urlString.split('\\/') : urlString.split('/');
        let weight = 0;
        // 权重，比如通配的不加权，非通配加权，防止通配出现在最前面
        for (const fragment of weightArr) {
          if (fragment === '' || fragment.includes(':') || fragment.includes('*')) {
            weight += 0;
          } else {
            weight += 1;
          }
        }

        let category = 2;
        const paramString = urlString.includes(':') ? urlString.replace(/:.+$/, '') : '';
        if (paramString) {
          category = 1;
        }
        if (urlString.includes('*')) {
          category = 0;
        }
        return {
          ...item,
          _pureRouter: urlString.replace(/\**$/, '').replace(/:\w+/, '123'),
          _level: urlString.split('/').length - 1,
          _paramString: paramString,
          _category: category,
          _weight: weight,
        };
      })
      .sort((handlerA, handlerB) => {
        // 不同一层级的对比
        if (handlerA._category !== handlerB._category) {
          return handlerB._category - handlerA._category;
        }

        // 不同权重
        if (handlerA._weight !== handlerB._weight) {
          return handlerB._weight - handlerA._weight;
        }

        // 不同长度
        if (handlerA._level === handlerB._level) {
          if (handlerB._pureRouter === handlerA._pureRouter) {
            return handlerA.url.toString().length - handlerB.url.toString().length;
          }
          return handlerB._pureRouter.length - handlerA._pureRouter.length;
        }
        return handlerB._level - handlerA._level;
      });
  }

  /**
   * 获取路由优先等级列表
   */
  public async getRouterPriorityList(): Promise<RouterPriority[]> {
    if (!this.isReady) {
      await this.analyze();
      this.isReady = true;
    }
    return this.routersPriority;
  }

  /**
   * 获取路由表
   */
  public async getRouterTable(): Promise<Map<string, RouterInfo[]>> {
    if (!this.isReady) {
      await this.analyze();
      this.isReady = true;
    }
    return this.routers;
  }

  /**
   * 获取扁平路由表
   */
  public async getFlattenRouterTable(): Promise<RouterInfo[]> {
    if (!this.isReady) {
      await this.analyze();
      this.isReady = true;
    }
    let routeArr = [];
    for (const routerPriority of this.routersPriority) {
      routeArr = routeArr.concat(this.routers.get(routerPriority.prefix));
    }
    return routeArr;
  }

  /**
   * 检查是否重复，并放入到map
   * @param prefix
   * @param routerInfo
   * @private
   */
  private checkDuplicateAndPush(prefix: string, routerInfo: RouterInfo) {
    // 获取前缀array
    const prefixList = this.routers.get(prefix);
    // 检查是否有重复
    const matched = prefixList.filter(item => {
      return routerInfo.url && item.url === routerInfo.url;
    });
    if (matched && matched.length) {
      throw new DuplicateRouteException(`${routerInfo.url}`, `${matched[0].handlerName}`, `${routerInfo.handlerName}`);
    }
    prefixList.push(routerInfo);
  }
}
