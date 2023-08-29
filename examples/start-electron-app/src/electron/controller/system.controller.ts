import { Event, Controller, Autowired, Context } from '@electron-boot/framework';
import { LoggerFactory } from '@electron-boot/logger';
import { IpcMainEvent } from 'electron';
import { UpdaterService } from '@electron-boot/updater';

@Controller
export class SystemController {
  private logger = LoggerFactory.getLogger(SystemController);

  @Autowired()
  ctx: Context;

  @Autowired()
  event: IpcMainEvent;

  @Autowired()
  updaterService: UpdaterService;
  @Event
  async showMessage(data: string) {
    console.log(this.event);
    function sleep(time) {
      return new Promise(resolve => setTimeout(resolve, time));
    }
    await sleep(5000);
    return data + 'world';
  }
  @Event()
  async checkUpdate() {
    await this.updaterService.checkUpdate();
  }
}
