import { Singleton } from '../../decorators/singleton.decorator';
import { ILogger, LoggerFactory } from '@electron-boot/logger';
import { Autowired } from '../../decorators/autowired.decorator';
import { ConfigService } from './config.service';
import { SocketService } from './socket.service';
import { Init } from '../../decorators/definition.decorator';
import { DecoratorName, DecoratorUtil } from '../../utils/decorator.util';
import { IApplicationContext } from '../../interface/context/application.context.interface';
import { ILifecycle } from '../../interface/context/lifecycle.interface';
import { IObjectLifecycle } from '../../interface/context/object.lifecycle.interface';

@Singleton()
export class LifecycleService {
  private logger: ILogger = LoggerFactory.getLogger(LifecycleService);

  @Autowired()
  protected configService: ConfigService;

  @Autowired()
  protected socketService: SocketService;

  @Autowired('rootContext')
  readonly applicationContext: IApplicationContext;

  @Init()
  protected async init() {
    // run lifecycle
    const cycles = DecoratorUtil.listModules(DecoratorName.MODULE) as Array<{
      target: any;
      instance?: any;
    }>;

    this.logger.debug(`[core]: Found Configuration length = ${cycles.length}`);

    const lifecycleInstanceList = [];
    for (const cycle of cycles) {
      // 普通类写法
      this.logger.debug('[core]: Lifecycle init');
      cycle.instance = await this.applicationContext.getAsync<ILifecycle>(cycle.target);
      cycle.instance && lifecycleInstanceList.push(cycle);
    }

    // bind object lifecycle
    await Promise.all([
      this.runObjectLifeCycle(lifecycleInstanceList, 'onBeforeObjectCreated'),
      this.runObjectLifeCycle(lifecycleInstanceList, 'onObjectCreated'),
      this.runObjectLifeCycle(lifecycleInstanceList, 'onObjectInit'),
      this.runObjectLifeCycle(lifecycleInstanceList, 'onBeforeObjectDestroy'),
    ]);

    // exec onConfigLoad()
    await this.runContainerLifeCycle(lifecycleInstanceList, 'onConfigLoad', configData => {
      if (configData) {
        this.configService.addObject(configData);
      }
    });

    // exec onReady()
    await this.runContainerLifeCycle(lifecycleInstanceList, 'onReady');

    // exec runtime.run()
    await this.socketService.run();

    // exec onSocketReady()
    await this.runContainerLifeCycle(lifecycleInstanceList, 'onSocketReady');
  }

  public async stop() {
    // stop lifecycle
    const cycles = DecoratorUtil.listModules(DecoratorName.MODULE) || [];

    for (const cycle of cycles.reverse()) {
      const inst: IObjectLifecycle = await this.applicationContext.getAsync<IObjectLifecycle>(cycle.target);
      // if (cycle.target instanceof FunctionalConfiguration) {
      //   // 函数式写法
      //   inst = cycle.target;
      // } else {
      // inst = await this.applicationContext.getAsync<ILifecycle>(cycle.target);
      // }

      await this.runContainerLifeCycle(inst, 'onStop');
    }

    // stop runtime
    await this.socketService.stop();
  }

  private async runContainerLifeCycle(lifecycleInstanceOrList: any[] | IObjectLifecycle, lifecycle: string, resultHandler?: (result: any) => void) {
    if (Array.isArray(lifecycleInstanceOrList)) {
      for (const cycle of lifecycleInstanceOrList) {
        if (typeof cycle.instance[lifecycle] === 'function') {
          this.logger.debug(`[core]: Lifecycle run ${cycle.instance.constructor.name} ${lifecycle}`);
          const result = await cycle.instance[lifecycle](this.applicationContext);
          if (resultHandler) {
            resultHandler(result);
          }
        }
      }
    } else {
      if (typeof lifecycleInstanceOrList[lifecycle] === 'function') {
        this.logger.debug(`[core]: Lifecycle run ${lifecycleInstanceOrList.constructor.name} ${lifecycle}`);
        const result = await lifecycleInstanceOrList[lifecycle](this.applicationContext);
        if (resultHandler) {
          resultHandler(result);
        }
      }
    }
  }

  private async runObjectLifeCycle(lifecycleInstanceList: any[], lifecycle: string) {
    for (const cycle of lifecycleInstanceList) {
      if (typeof cycle.instance[lifecycle] === 'function') {
        this.logger.debug(`[core]: Lifecycle run ${cycle.instance.constructor.name} ${lifecycle}`);
        return this.applicationContext[lifecycle](cycle.instance[lifecycle].bind(cycle.instance));
      }
    }
  }
}
