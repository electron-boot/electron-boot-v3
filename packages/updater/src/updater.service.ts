import { Autowired, Config, IBrowserWindow, Init, Singleton } from '@electron-boot/framework';
import { autoUpdater } from 'electron-updater';
import { EventData } from './interface';
@Singleton()
export class UpdaterService {
  private isReady = false;
  @Config('autoUpdater')
  private updaterConfig: any;
  @Autowired()
  private mainWindow: IBrowserWindow;
  @Init()
  async init() {
    if (this.isReady) return;
    // 获取配置信息
    const updateConfig = this.updaterConfig;
    // 是否后台自动下载
    autoUpdater.autoDownload = updateConfig.force;
    // 设置下载地址
    try {
      autoUpdater.setFeedURL(updateConfig.options);
    } catch (e) {
      console.log('[autoUpdater] setFeedURL error', e);
    }
    autoUpdater.signals.progress(progressInfo => {
      console.log(progressInfo);
    });
    this.mainWindow.on('ready-to-show', async () => {
      if (updateConfig.autoCheck) await this.checkUpdate();
    });
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
   * @param context
   * @private
   */
  private sendStatusToWindow(context: EventData) {
    const textJson = JSON.stringify(context);
    const channel = '/system/appUpdater';
    this.mainWindow.getInstance()?.webContents?.send(channel, textJson);
  }
}
