import { Autowired, Config, IBrowserWindow, Init, PlatformUtil, Singleton } from '@electron-boot/framework';
import { ILogger, LoggerFactory } from '@electron-boot/logger';
import { autoUpdater } from 'electron-updater';
import { AutoUpdate, EventData, EventType } from './interface';

@Singleton()
export class UpdaterService {
  private isReady = false;
  private logger: ILogger = LoggerFactory.getLogger(UpdaterService);
  @Config('autoUpdater')
  private updaterConfig: AutoUpdate;
  @Autowired()
  private mainWindow: IBrowserWindow;
  @Init()
  async init() {
    if (this.isReady) return;
    if (
      !(
        (PlatformUtil.isWindows() && this.updaterConfig.windows) ||
        (PlatformUtil.isMacOS() && this.updaterConfig.macOS) ||
        (PlatformUtil.isLinux() && this.updaterConfig.linux)
      )
    ) {
      return;
    }
    try {
      autoUpdater.setFeedURL(this.updaterConfig.options);
    } catch (e) {
      this.logger.error('setFeedURL error', e);
    }
    /**
     * 正在检查更新
     */
    autoUpdater.on('checking-for-update', () => {
      console.log('正在检查更新');
      this.sendStatusToWindow({
        eventType: EventType.checking,
      });
    });
    autoUpdater.on('update-available', updateInfo => {
      console.log('有更新');
      this.sendStatusToWindow({
        eventType: EventType.available,
        updateInfo,
      });
    });
    autoUpdater.on('update-not-available', updateInfo => {
      console.log('没有更新');
      this.sendStatusToWindow({
        eventType: EventType.noAvailable,
        updateInfo,
      });
    });
    autoUpdater.on('error', (error, message) => {
      this.sendStatusToWindow({
        eventType: EventType.error,
        errorInfo: {
          message: message,
          error,
        },
      });
    });
    autoUpdater.on('download-progress', progressInfo => {
      this.sendStatusToWindow({
        eventType: EventType.progress,
        progressInfo,
      });
    });
    autoUpdater.on('update-downloaded', event => {
      this.sendStatusToWindow({
        eventType: EventType.progress,
        downloadedInfo: event,
      });
      autoUpdater.quitAndInstall();
    });
    autoUpdater.autoDownload = this.updaterConfig.force;
    if (this.updaterConfig.force) await this.checkUpdate();
    this.isReady = true;
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
    await autoUpdater.downloadUpdate();
  }

  /**
   * send message to main window
   * @param data
   * @private
   */
  private sendStatusToWindow(data: EventData) {
    const textJson = JSON.stringify(data);
    const channel = '/system/appUpdater';
    this.mainWindow.getInstance()?.webContents?.send(channel, textJson);
  }
}
