import { UserService } from './user.service';
import { AppConfig } from './config.default';
import { Module } from '../../../src/decorators/module.decorator';
import { Autowired } from '../../../src/decorators/autowired.decorator';
import { IBrowserWindow } from '../../../src/interface/clients/browser.window.interface';

@Module({
  providers: [UserService],
  configs: [{ default: AppConfig }],
})
export class AppModule {
  @Autowired()
  mainWindow: IBrowserWindow;
  onReady() {
    console.log('进来了', this.mainWindow);
  }
}
