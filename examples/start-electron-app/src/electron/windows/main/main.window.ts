import { Init, Singleton } from '@electron-boot/framework';
import { Autowired, StateService, AbstractWindow } from '@electron-boot/framework';

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
  @Autowired()
  stateService: StateService;

  @Init()
  init() {}
}
