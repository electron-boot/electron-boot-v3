import { AppConfig } from './config.default';
import { Module } from '../../../src';
import { Autowired } from '../../../src';
import { Init } from '../../../src';
import { System } from './system.conteroller';
import { IBrowserWindow } from '../../../src';
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
