import { AppConfig } from './config.default';
import { Module } from '../../../src/decorators/module.decorator';
import { Autowired } from '../../../src/decorators/autowired.decorator';
import { IBrowserWindow } from '../../../src/interface/client.interface';
import { Init } from '../../../src/decorators/definition.decorator';
import { System } from './system.conteroller';
@Module({
  providers: [System],
  configs: [{ default: AppConfig }],
})
export class AppModule {
  @Autowired()
  mainWindow: IBrowserWindow;
  @Init()
  async init() {
    this.mainWindow.on('ready-to-show', () => {
      const readyTime = new Date().getTime();
      console.log('ready-to-show', readyTime);
      this.mainWindow.show();
    });
  }
}
