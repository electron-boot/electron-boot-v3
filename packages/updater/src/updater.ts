import { Autowired, IApplicationContext, Init, Module } from '@electron-boot/framework';
import { UpdaterService } from './updater.service';

@Module({
  providers: [UpdaterService],
})
export class UpdaterModule {
  @Autowired('rootContext')
  applicationContext: IApplicationContext;
  @Init()
  async init() {
    await this.applicationContext.getAsync(UpdaterService);
  }
}
