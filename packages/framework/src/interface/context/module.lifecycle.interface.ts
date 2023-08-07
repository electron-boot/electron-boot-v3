import { IApplicationContext } from './application.context.interface';

export interface ModuleLifecycle {
  onConfigLoad?(applicationContext?: IApplicationContext): Promise<any> | any;
  onReady?(applicationContext?: IApplicationContext): Promise<void> | void;
  onStop?(applicationContext?: IApplicationContext): Promise<void> | void;
  onSocketReady?(applicationContext?: IApplicationContext): Promise<void> | void;
}
