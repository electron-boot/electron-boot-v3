import { ISocket } from '../../interface/support/support.interface';
import { Socket } from '../../decorators/socket.decorator';
import { EventService } from './event.service';
import { Autowired } from '../../decorators/autowired.decorator';
import { ipcMain, IpcMainEvent } from 'electron';
import { ApplicationContext } from '../../decorators/custom.decorator';
import { ILogger, LoggerFactory } from '@electron-boot/logger';
import { RequestApplicationContext } from '../../context/request.application.context';
import { IApplicationContext } from '../../interface/context/application.context.interface';
import { Context } from '../../interface/context/context.interface';

@Socket()
export class IpcService implements ISocket {
  // 默认的上下文
  private defaultContext = {};
  private _isEnable: boolean = true;
  private logger: ILogger = LoggerFactory.getLogger(IpcService);
  @ApplicationContext()
  private applicationContext: IApplicationContext;
  @Autowired()
  protected eventService: EventService;
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
    const eventMap = await this.eventService.getEventList();
    for (const eventInfo of Array.from(eventMap.values())) {
      const channel = eventInfo.eventName;

      const ipcResult = async (event: any, data: any) => {
        const ctx = event as Context;
        this.createAnonymousContext(ctx);
        event.requestContext = ctx.requestContext;
        ctx.requestContext.registerObject('event', event);
        ctx.requestContext.registerObject('data', data);
        const controller = await event.requestContext.getAsync(eventInfo.id);
        let result;
        if (typeof eventInfo.method !== 'string') {
          result = await eventInfo.method({ event, data });
        } else {
          result = await controller[eventInfo.method].call(controller, { event, data });
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

  async stop(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
