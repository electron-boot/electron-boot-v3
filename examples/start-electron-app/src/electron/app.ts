import { Autowired, IBrowserWindow, Init, Module } from '@electron-boot/framework';
import { LoggerFactory } from '@electron-boot/logger';
import { SystemController } from './controller/system.controller';
import defaultConfig from './config/config.default';

@Module({
  providers: [SystemController],
  configs: [{ default: defaultConfig }],
})
export class AppModule {
  private logger = LoggerFactory.getLogger(AppModule);

  @Autowired()
  mainWindow: IBrowserWindow;
  @Init()
  async init() {
    this.mainWindow.on('ready-to-show', () => {
      this.mainWindow.show();
    });
  }
}
