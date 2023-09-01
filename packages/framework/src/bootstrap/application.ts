import { BootstrapOptions } from '../interface/bootstrap/bootstrap.interface';
import { SocketService } from '../supports/service/socket.service';
import { LifecycleService } from '../supports/service/lifecycle.service';
import { DecoratorUtil } from '../utils/decorator.util';
import * as util from 'util';
import { GenericApplicationContext } from '../context/generic.application.context';
import { ModuleLoader } from '../supports/module.loader';
import { EnvironmentService } from '../supports/service/environment.service';
import { AspectService } from '../supports/service/aspect.service';
import { DecoratorService } from '../supports/service/decorator.service';
import { ConfigService } from '../supports/service/config.service';
import { IpcService } from '../supports/service/ipc.service';
import defaultConfig from '../config/config.default';
import { ILogger, LoggerFactory } from '@electron-boot/logger';
import { EventService } from '../supports/service/event.service';
import { IApplicationContext } from '../interface/context/application.context.interface';
import { StateService } from '../supports';
let stepIdx = 1;
export class Application {
  protected globalOptions: Partial<BootstrapOptions> = {};
  protected logger: ILogger = LoggerFactory.getLogger(Application);
  private applicationContext: IApplicationContext;
  private moduleLoader: ModuleLoader;
  private printStepDebugInfo(stepInfo: string) {
    this.logger.debug(`\n\nStep ${stepIdx++}: ${stepInfo}\n`);
  }

  private async prepareGlobalApplicationContext(): Promise<IApplicationContext> {
    this.printStepDebugInfo('Ready to create applicationContext');

    this.logger.debug('[framework]: start "initializeGlobalApplicationContext"');
    this.logger.debug(`[framework]: bootstrap options = ${util.inspect(this.globalOptions)}`);

    // new applicationContext
    const applicationContext = this.globalOptions.applicationContext ?? new GenericApplicationContext();

    // bind moduleLoader
    this.moduleLoader = new ModuleLoader(applicationContext);

    // bind moduleStore to DecoratorUtil
    this.logger.debug('[core]: delegate module map from DecoratorUtil');
    DecoratorUtil.bindModuleStore(applicationContext);

    global['ELECTRON_APPLICATION_CONTEXT'] = applicationContext;

    this.printStepDebugInfo('Ready module detector');

    this.printStepDebugInfo('Binding inner service');
    // bind inner service
    applicationContext.register(EnvironmentService);
    applicationContext.register(AspectService);
    applicationContext.register(DecoratorService);
    applicationContext.register(ConfigService);
    applicationContext.register(IpcService);
    applicationContext.register(SocketService);
    applicationContext.register(LifecycleService);
    applicationContext.register(EventService);
    applicationContext.register(StateService);

    this.printStepDebugInfo('Binding preload module');

    // bind preload module
    if (this.globalOptions.preloadModules && this.globalOptions.preloadModules.length) {
      for (const preloadModule of this.globalOptions.preloadModules) {
        applicationContext.register(preloadModule);
      }
    }

    this.printStepDebugInfo('Init ConfigService, AspectService, DecoratorService');
    // init default config
    const configService = applicationContext.get(ConfigService);
    configService.add([
      {
        default: defaultConfig,
      },
    ]);

    // init aop support
    applicationContext.get(AspectService);

    // init decorator service
    applicationContext.get(DecoratorService);

    this.printStepDebugInfo('Load imports(component) and user code configuration module');

    for (const importModule of [].concat(this.globalOptions.imports)) {
      // load module
      if (importModule) {
        this.moduleLoader.load(importModule);
      }
    }

    if (this.globalOptions.globalConfig) {
      if (Array.isArray(this.globalOptions.globalConfig)) {
        configService.add(this.globalOptions.globalConfig);
      } else {
        configService.addObject(this.globalOptions.globalConfig);
      }
    }

    this.printStepDebugInfo('Load config file');

    // merge config
    configService.load();
    this.logger.debug('[core]: Current config = %j', configService.getConfiguration());

    // init state
    await applicationContext.getAsync(StateService);

    return applicationContext;
  }
  private async initializeGlobalApplicationContext(): Promise<IApplicationContext> {
    const applicationContext = await this.prepareGlobalApplicationContext();

    this.printStepDebugInfo('Init runtime');

    await applicationContext.getAsync(SocketService);

    this.printStepDebugInfo('Init lifecycle');

    // lifecycle support
    await applicationContext.getAsync(LifecycleService);

    this.printStepDebugInfo('Init preload modules');

    // some preload module init
    const modules = DecoratorUtil.getPreloadModules();
    for (const module of modules) {
      // preload init context
      await applicationContext.getAsync(module);
    }

    this.printStepDebugInfo('End of initialize and start');

    return applicationContext;
  }
  private async destroyGlobalApplicationContext(applicationContext: IApplicationContext) {
    // stop lifecycle
    const lifecycleService = await applicationContext.getAsync(LifecycleService);
    await lifecycleService.stop();
    // stop applicationContext
    await applicationContext.close();
    // clear applicationContext
    global['ELECTRON_APPLICATION_CONTEXT'] = null;
  }

  public configure(options: BootstrapOptions = {}) {
    this.globalOptions = options;
    return this;
  }
  public async run() {
    this.applicationContext = await this.initializeGlobalApplicationContext();
    return this.applicationContext;
  }
  public async stop() {
    if (this.applicationContext) {
      await this.destroyGlobalApplicationContext(this.applicationContext);
    }
  }
  public getApplicationContext(): IApplicationContext {
    return this.applicationContext;
  }
}
