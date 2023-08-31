import { Singleton } from '../../decorators/singleton.decorator';

@Singleton()
export class StateService<T extends Record<string, any> = Record<string, unknown>> {}
