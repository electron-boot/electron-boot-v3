import { Init, Singleton } from '@electron-boot/framework';
import { Autowired, StateService, AbstractWindow } from '@electron-boot/framework';
import { ILogger, LoggerFactory } from '@electron-boot/logger';

export interface IWindowCreationOptions {
  width?: number;
  height?: number;
}

declare module '@electron-boot/framework' {
  export interface IConfig {
    mainWindow: IWindowCreationOptions;
  }
}

@Singleton()
export default class MainWindow extends AbstractWindow {
  protected logger: ILogger = LoggerFactory.getLogger(MainWindow);
  protected windowControlHeightStateStorageKey: string;
  @Autowired()
  stateService: StateService;

  @Init()
  init() {}
}
