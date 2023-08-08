import { Autowired, IApplicationContext, Init, Module } from '@electron-boot/framework';
import { UpdaterService } from './updater.service';

@Module()
export class UpdaterModule {
  @Autowired()
  applicationContext: IApplicationContext;
  @Init()
  async init() {
    await this.applicationContext.getAsync(UpdaterService);
  }
}
