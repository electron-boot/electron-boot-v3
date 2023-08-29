import { Autowired, IApplicationContext, Init, Module } from '@electron-boot/framework';
import { UpdaterService } from './updater.service';
import { IBrowserWindow } from '@electron-boot/framework/src';

@Module({
  providers: [UpdaterService],
})
export class UpdaterModule {
  @Autowired('rootContext')
  applicationContext: IApplicationContext;

  @Autowired()
  private mainWindow: IBrowserWindow;
  @Init()
  async init() {
    await this.applicationContext.getAsync(UpdaterService);
  }
}
