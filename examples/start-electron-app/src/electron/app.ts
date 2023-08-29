import { Autowired, Init, Module } from '@electron-boot/framework';
import { LoggerFactory } from '@electron-boot/logger';
import { SystemController } from './controller/system.controller';
import defaultConfig from './config/config.default';
import { UpdaterModule } from '@electron-boot/updater';
import MainWindow from './windows/main/main.window';

@Module({
  imports: [UpdaterModule],
  providers: [SystemController, MainWindow],
  configs: [{ default: defaultConfig }],
})
export class AppModule {
  private logger = LoggerFactory.getLogger(AppModule);

  @Autowired()
  mainWindow: MainWindow;
  @Init()
  async init() {
    console.log('进来了');
  }
}
