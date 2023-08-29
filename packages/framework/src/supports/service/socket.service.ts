import { Singleton } from '../../decorators/singleton.decorator';
import { Autowired } from '../../decorators/autowired.decorator';
import { AspectService } from './aspect.service';
import { ConfigService } from './config.service';
import { DecoratorService } from './decorator.service';
import { ISocket } from '../../interface/support/support.interface';
import { Init } from '../../decorators/definition.decorator';
import { DecoratorName, DecoratorUtil } from '../../utils/decorator.util';
import { ALL } from '../../constant';
import { ApplicationContext } from '../../decorators/custom.decorator';
import { ILogger, LoggerFactory } from '@electron-boot/logger';
import { IApplicationContext } from '../../interface/context/application.context.interface';

@Singleton()
export class SocketService {
  private logger: ILogger = LoggerFactory.getLogger(SocketService);
  @Autowired()
  aspectService: AspectService;

  @Autowired()
  configService: ConfigService;

  @Autowired()
  decoratorService: DecoratorService;

  @ApplicationContext()
  applicationContext: IApplicationContext;

  private globalSocketList: Array<ISocket> = [];
  @Init()
  async init() {
    // register @Config decorator handler
    this.decoratorService.registerPropertyHandler(DecoratorName.CONFIG, (propertyName, meta) => {
      if (meta.identifier === ALL) {
        return this.configService.getConfiguration();
      } else {
        return this.configService.getConfiguration(meta.identifier ?? propertyName);
      }
    });

    const sockets: Array<new (...args) => any> = DecoratorUtil.listModules(DecoratorName.SOCKET);
    if (sockets.length) {
      for (const socket of sockets) {
        if (!this.applicationContext.registry.hasDefinition(DecoratorUtil.getBeanDefinition(socket).id)) {
          this.logger.debug(`[core]: Found socket "${socket.name}" but missing definition, skip initialize.`);
          continue;
        }
        const socketInstance = await this.applicationContext.getAsync(socket);
        this.globalSocketList.push(socketInstance);
      }
    }

    await this.aspectService.loadAspect();
  }
  async run() {
    for (const socket of this.globalSocketList) {
      // if enabled, just run socket
      if (socket.isEnable()) {
        // app init
        await socket.run();
        this.logger.debug(`[core]: Found socket "${socket.getName()}" and run.`);
      }
    }
  }

  async stop() {}
}
