import { Controller } from '../../../src/decorators/controller.decorator';
import { Action } from '../../../src/decorators/action.decorator';

@Controller('/system')
export class System {
  @Action('/close')
  close({ event, data }) {
    console.log('进来了', event, data);
    return `${data.a + data.b}`;
  }
}
