import { Init, Singleton } from '@electron-boot/framework';
import { Autowired, StateService } from '@electron-boot/framework';

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
export default class MainWindow {
  @Autowired()
  stateService: StateService;
  constructor() {
    console.log(this.stateService);
  }
  @Init()
  init() {}
}
