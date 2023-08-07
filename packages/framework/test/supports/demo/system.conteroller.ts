import { Controller } from '../../../src';
import { Action } from '../../../src';

@Controller('/system')
export class System {
  @Action('/close')
  close({ event, data }) {
    console.log('进来了', event, data);
    return `${data.a + data.b}`;
  }
}
