import { IObjectLifecycle } from './object.lifecycle.interface';
import { ModuleLifecycle } from './module.lifecycle.interface';

export interface ILifecycle extends IObjectLifecycle, ModuleLifecycle {}
