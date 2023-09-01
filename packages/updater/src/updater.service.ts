import { Config, Init, Singleton } from '@electron-boot/framework';
import { ILogger, LoggerFactory } from '@electron-boot/logger';
import { AutoUpdate } from './interface';
import { EventEmitter } from 'node:events';
import { AppUpdater, autoUpdater } from 'electron-updater';

@Singleton()
export class UpdaterService extends EventEmitter {
  private isReady = false;

  private logger: ILogger = LoggerFactory.getLogger(UpdaterService);

  private _autoUpdater: AppUpdater = autoUpdater;

  @Config('autoUpdater')
  private updaterConfig: AutoUpdate;

  @Init()
  async init() {
    if (this.isReady) return;
    try {
      this._autoUpdater.setFeedURL(this.updaterConfig.options);
    } catch (e) {
      this.logger.warn('setFeedURL error', e);
      throw e;
    }
    if (this.updaterConfig.token) {
      this._autoUpdater.addAuthHeader(this.updaterConfig.token);
    }
    [
      'login',
      'checking-for-update',
      'update-available',
      'update-not-available',
      'update-cancelled',
      'download-progress',
      'update-downloaded',
      'error',
    ].forEach((event: any) => {
      this._autoUpdater.on(event, (...args: any[]) => {
        console.log('打印日志');
        this.emit(event, ...args);
      });
    });
    // with token
    if (this.updaterConfig.token) {
      this._autoUpdater.addAuthHeader(this.updaterConfig.token);
    }
    if (typeof this.updaterConfig.forced === 'boolean') {
      this._autoUpdater.forceDevUpdateConfig = this.updaterConfig.forced;
    }
  }

  get appUpdater(): AppUpdater {
    return this._autoUpdater;
  }
  quitAndInstall() {
    this._autoUpdater.quitAndInstall();
  }
  /**
   * check update
   */
  async checkUpdate() {
    return await autoUpdater.checkForUpdates();
  }

  /**
   * download update
   */
  async download() {
    return await autoUpdater.downloadUpdate();
  }
}
