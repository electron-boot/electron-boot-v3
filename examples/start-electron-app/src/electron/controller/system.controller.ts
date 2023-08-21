import { Event, Controller, Autowired, Context } from '@electron-boot/framework';
import { LoggerFactory } from '@electron-boot/logger';

@Controller
export class SystemController {
  private logger = LoggerFactory.getLogger(SystemController);

  @Autowired()
  ctx: Context;

  @Event
  async showMessage(data: string) {
    function sleep(time) {
      return new Promise(resolve => setTimeout(resolve, time));
    }
    await sleep(5000);
    return data + 'world';
  }
}
