import { ISocket } from '../../interface/support.interface';
import { Socket } from '../../decorators/socket.decorator';
import { RouterService } from './router.service';
import { Autowired } from '../../decorators/autowired.decorator';
import { ipcMain, IpcMainEvent } from 'electron';
import { Context, IApplicationContext } from '../../interface/context.interface';
import { ApplicationContext } from '../../decorators/custom.decorator';
import { ILogger, LoggerFactory } from '@electron-boot/logger';
import { PathUtil } from '../../utils/path.util';
import { RequestApplicationContext } from '../../context/request.application.context';

@Socket()
export class IpcService implements ISocket {
  // 默认的上下文
  private defaultContext = {};
  private _isEnable: boolean = true;
  private logger: ILogger = LoggerFactory.getLogger(IpcService);
  @ApplicationContext()
  private applicationContext: IApplicationContext;
  @Autowired()
  protected routerService: RouterService;
  getName(): string {
    return 'ipc';
  }

  isEnable(): boolean {
    return this._isEnable;
  }

  private createAnonymousContext(extendCtx?: Context): Context {
    const ctx = extendCtx || Object.create(this.defaultContext);
    if (ctx.startTime) {
      ctx.startTime = Date.now();
    }
    if (!ctx.requestContext) {
      ctx.requestContext = new RequestApplicationContext(ctx, this.applicationContext);
      ctx.requestContext.ready();
    }
    ctx.setAttr = (key: string, value: any) => {
      ctx.requestContext.setAttr(key, value);
    };
    ctx.getAttr = <T>(key: string): T => {
      return ctx.requestContext.getAttr(key);
    };
    return ctx;
  }

  async run(): Promise<void> {
    const routerTable = await this.routerService.getRouterTable();
    const routerList = await this.routerService.getRouterPriorityList();
    for (const routerPriority of routerList) {
      // 绑定控制器
      this.applicationContext.register(routerPriority.routerModule);
      // 打印加载日志
      this.logger.debug(`Load Controller "${routerPriority.controllerId}", prefix=${routerPriority.prefix}`);
      // 添加路由
      const routers = routerTable.get(routerPriority.prefix);
      for (const router of routers) {
        const channel = PathUtil.joinURLPath(router.prefix, router.url);
        /**
         * ipc事件处理结果
         * @param event
         * @param data
         */
        const ipcResult = async (event: any, data: any) => {
          const ctx = event as Context;
          this.createAnonymousContext(ctx);
          event.requestContext = ctx.requestContext;
          ctx.requestContext.registerObject('event', event);
          ctx.requestContext.registerObject('data', data);
          const controller = await event.requestContext.getAsync(router.id);
          let result;
          if (typeof router.method !== 'string') {
            result = await router.method({ event, data });
          } else {
            result = await controller[router.method].call(controller, { event, data });
          }
          return result;
        };
        // 创建监听
        ipcMain.on(channel, async (event: IpcMainEvent, data: any) => {
          const result = await ipcResult(event, data);
          event.returnValue = result;
          event.reply(`${channel}`, result);
        });
        // 创建handler
        ipcMain.handle(channel, async (event: IpcMainEvent, data: any) => {
          return await ipcResult(event, data);
        });
      }
    }
  }

  async stop(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
