import { Singleton } from '../../decorators/singleton.decorator';
import { AppInfo } from '../../interface/support/support.interface';
import { EnvironmentService } from './environment.service';
import { Autowired } from '../../decorators/autowired.decorator';
import { Destroy, Init } from '../../decorators/definition.decorator';
import { ObjectUtil } from '../../utils/object.util';
import { TypesUtil } from '../../utils/types.util';
import { IApplicationContext } from '../../interface/context/application.context.interface';
import { app } from 'electron';

interface ConfigMergeInfo {
  value: any;
  env: string;
  extraPath?: string;
}
@Singleton()
export class ConfigService {
  private envDirMap: Map<string, Set<any>> = new Map();
  private aliasMapping = {
    production: 'prod',
    development: 'dev',
  };
  private configMergeOrder: Array<ConfigMergeInfo> = [];
  protected configuration = {};
  protected isReady = false;
  protected externalObject: Record<string, unknown>[] = [];
  protected appInfo: AppInfo;
  protected configFilterList: Array<(config: Record<string, any>) => Record<string, any> | undefined> = [];

  @Autowired()
  environmentService: EnvironmentService;

  @Autowired('rootContext')
  readonly applicationContext: IApplicationContext;

  @Init()
  init() {
    this.appInfo = {
      runnerPath: this.environmentService.isDevelopment() ? process.cwd() : app.getAppPath(),
      name: app.getName(),
      version: app.getVersion(),
      HOME: app.getPath('home'),
      env: this.environmentService.getEnvironment(),
    } as AppInfo;
  }

  add(configs: Array<{ [p: string]: Record<string, any> }>) {
    for (const config of configs) {
      for (const env in config) {
        this.getEnvSet(env).add(config[env]);
        if (this.aliasMapping[env]) {
          this.getEnvSet(this.aliasMapping[env]).add(config[env]);
        }
      }
    }
  }

  addObject(obj: Record<string, unknown>, reverse = false) {
    if (this.isReady) {
      this.configMergeOrder.push({
        env: 'default',
        extraPath: '',
        value: obj,
      });
      if (reverse) {
        this.configuration = ObjectUtil.extend(true, obj, this.configuration);
      } else {
        ObjectUtil.extend(true, this.configuration, obj);
      }
    } else {
      this.externalObject.push(obj);
    }
  }

  addFilter(filter: (config: Record<string, any>) => Record<string, any>) {
    if (filter) {
      this.configFilterList.push(filter);
    }
  }

  getConfiguration(configKey?: string) {
    if (configKey) {
      return this.safelyGet(configKey, this.configuration);
    }
    return this.configuration;
  }

  getConfigMergeOrder(): Array<ConfigMergeInfo> {
    return this.configMergeOrder;
  }

  load() {
    if (this.isReady) return;
    const defaultSet = this.getEnvSet('default');
    const environmentSet = this.getEnvSet(this.appInfo.env);
    const target = {};
    const defaultSetLength = defaultSet.size;
    for (const [index, data] of [...defaultSet, ...environmentSet].entries()) {
      let config = data;
      if (TypesUtil.isFunction(config)) {
        config = config.call(config, this.appInfo, target);
      }
      if (!config) {
        continue;
      }
      config = this.runFilter(config);
      if (!config) {
        continue;
      }
      this.configMergeOrder.push({
        env: index < defaultSetLength ? 'default' : this.appInfo.env,
        extraPath: data,
        value: config,
      });
      ObjectUtil.extend(true, target, config);
    }
    if (this.externalObject.length) {
      for (let externalObject of this.externalObject) {
        if (externalObject) {
          externalObject = this.runFilter(externalObject);
          if (!externalObject) {
            continue;
          }
          ObjectUtil.extend(true, target, externalObject);
          this.configMergeOrder.push({
            env: 'default',
            extraPath: '',
            value: externalObject,
          });
        }
      }
    }
    this.configuration = target;
    this.isReady = true;
  }

  private getEnvSet(env: string) {
    if (!this.envDirMap.has(env)) {
      this.envDirMap.set(env, new Set());
    }
    return this.envDirMap.get(env);
  }

  private runFilter(config: Record<string, any>) {
    for (const filter of this.configFilterList) {
      config = filter(config);
    }
    return config;
  }

  safelyGet(list: string | string[], obj?: Record<string, unknown>): any {
    if (arguments.length === 1) {
      return (_obj: Record<string, unknown>) => this.safelyGet(list, _obj);
    }

    if (typeof obj === 'undefined' || typeof obj !== 'object' || obj === null) {
      return void 0;
    }
    const pathArrValue = typeof list === 'string' ? list.split('.') : list;
    let willReturn: any = obj;

    for (const key of pathArrValue) {
      if (typeof willReturn === 'undefined' || willReturn === null) {
        return void 0;
      } else if (typeof willReturn !== 'object') {
        return void 0;
      }
      willReturn = willReturn[key];
    }
    return willReturn;
  }

  @Destroy()
  destroy() {}
}
