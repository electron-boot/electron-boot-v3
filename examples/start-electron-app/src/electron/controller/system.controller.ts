import { Event, Controller } from '@electron-boot/framework';
import { LoggerFactory } from '@electron-boot/logger';

@Controller
export class SystemController {
  private logger = LoggerFactory.getLogger(SystemController);
  @Event
  showMessage({ data }: any) {
    console.log('这是当前的输出asd', data.a);
  }
}
