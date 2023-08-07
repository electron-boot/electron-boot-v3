import { AbstractServiceFactory } from './abstract.service.factory';
import { Singleton } from '../../decorators/singleton.decorator';
import { Autowired } from '../../decorators/autowired.decorator';
import { ConfigService } from '../service/config.service';
import { ApplicationContext } from '../../decorators/custom.decorator';
import { Init } from '../../decorators/definition.decorator';
import { WindowClient } from '../client/window.client';
import { IApplicationContext } from '../../interface/context/application.context.interface';
import { IBrowserWindow } from '../../interface/clients/browser.window.interface';

@Singleton()
export class WindowServiceFactory extends AbstractServiceFactory<IBrowserWindow> {
  private idMap: Map<number, string> = new Map();
  private lazyWindowConfigMap: Map<string, any> = new Map();
  @ApplicationContext()
  readonly applicationContext: IApplicationContext;
  @Autowired()
  private configService: ConfigService;
  private mainWindow: IBrowserWindow;
  @Init()
  async init(): Promise<void> {
    await this.initClients(this.configService.getConfiguration('windowsOptions'));
    this.mainWindow = this.getWindow('main');
    this.openMainWindow();
    this.applicationContext.registerObject('mainWindow', this.mainWindow);
  }

  private async openMainWindow() {
    if (!this.mainWindow) {
      throw new Error('can not find main window');
    }
    // 禁止主窗口被关闭
    if (process.platform === 'darwin') {
      this.mainWindow.disableClose();
    }
    // 等待窗口创建完成
    await this.mainWindow.open();
  }

  getWindow(name: string): IBrowserWindow {
    const window = this.get(name);
    if (window) {
      return window;
    }
    if (this.lazyWindowConfigMap.has(name)) {
      this.createInstance(this.lazyWindowConfigMap.get(name), name);
      this.lazyWindowConfigMap.delete(name);
    }
  }

  getMainWindow(): IBrowserWindow {
    return this.mainWindow;
  }

  async getWindowAsync(name: string): Promise<IBrowserWindow> {
    const window = this.get(name);
    if (window) {
      return window;
    }
    if (this.lazyWindowConfigMap.has(name)) {
      await this.createInstanceAsync(this.lazyWindowConfigMap.get(name), name);
      this.lazyWindowConfigMap.delete(name);
    }
  }

  protected createClient(config: any, clientName: string): void | IBrowserWindow {
    if (!config.lazyLoad) {
      const window = new WindowClient(config);
      window.once('ready-to-show', () => {
        this.idMap.set(window.getInstance().id, clientName);
      });
      return window;
    } else {
      delete config['lazyLoad'];
      this.lazyWindowConfigMap.set(clientName, config);
    }
  }

  protected createClientAsync(config: any, clientName: string): Promise<IBrowserWindow> {
    if (!config.lazyLoad) {
      const window = new WindowClient(config);
      window.once('ready-to-show', () => {
        this.idMap.set(window.getInstance().id, clientName);
      });
      return Promise.resolve(window);
    } else {
      delete config['lazyLoad'];
      this.lazyWindowConfigMap.set(clientName, config);
    }
  }

  protected destroyClient(client: IBrowserWindow): void {
    client.close();
  }

  protected destroyClientAsync(client: IBrowserWindow): Promise<void> {
    client.close();
    return Promise.resolve();
  }
  getName(): string {
    return 'window';
  }
}
