import { BrowserWindow } from 'electron';
import * as events from 'events';
import { BrowserWindowOptions, IBrowserWindow } from '../../interface/clients/browser.window.interface';
const windowEvents = [
  'close',
  'closed',
  'session-end',
  'unresponsive',
  'responsive',
  'blur',
  'focus',
  'show',
  'hide',
  'ready-to-show',
  'maximize',
  'unmaximize',
  'minimize',
  'restore',
  'will-resize',
  'resize',
  'will-move',
  'move',
  'moved',
  'enter-full-screen',
  'leave-full-screen',
  'enter-html-full-screen',
  'leave-html-full-screen',
  'always-on-top-changed',
  'app-command',
  'scroll-touch-begin',
  'scroll-touch-end',
  'scroll-touch-edge',
  'swipe',
  'rotate-gesture',
  'sheet-begin',
  'sheet-end',
  'new-window-for-tab',
];
export class WindowClient extends events implements IBrowserWindow {
  // 是否可关闭
  private canClose: boolean = true;
  // 窗口id
  private _id: number;
  // 窗口唯一标识
  protected name: string;
  // 默认创建窗口参数
  protected options: BrowserWindowOptions;
  // 当前窗口实例
  protected windowInstance: BrowserWindow | null;
  constructor(options: BrowserWindowOptions = {}) {
    super();
    this.options = options;
    this.windowInstance = null;
  }
  /**
   * 判断窗口实例是否存在
   */
  isInstanceExist() {
    return !!this.windowInstance;
  }
  get id() {
    return this._id;
  }
  /**
   * 获取窗口实例
   */
  getInstance(): BrowserWindow {
    return this.windowInstance;
  }

  getCanClose(): boolean {
    return this.canClose;
  }

  enableClose() {
    this.canClose = true;
  }

  disableClose() {
    this.canClose = false;
  }

  /**
   * 打开页面
   * @param options
   */
  async open(options: BrowserWindowOptions = {}): Promise<BrowserWindow> {
    if (this.windowInstance) return this.windowInstance;
    // merge options
    const _options = Object.assign({}, this.options, options);
    // create window instance
    this.windowInstance = new BrowserWindow(_options);
    // get window id
    this._id = this.windowInstance.id;
    // add window events
    windowEvents.forEach(eventName => {
      this.windowInstance.on(eventName as any, (...args) => {
        // publish even
        this.publisher(eventName, { ...args });
        // prevent window from sending down events
        if (eventName === 'close') {
          if (!this.canClose) {
            args[0].preventDefault(); // 阻止关闭
            this.windowInstance.hide(); // 使用隐藏
          }
        } else if (eventName === 'closed') {
          this.windowInstance = null;
        }
      });
    });
    // load html
    await this.windowInstance.loadURL(_options.url);
    // return window instance
    return this.windowInstance;
  }

  show() {
    this.windowInstance?.show();
  }

  hide() {
    this.windowInstance?.hide();
  }

  restore() {
    if (this.windowInstance) {
      if (this.windowInstance.isMaximized()) {
        this.windowInstance.restore();
      }
      this.windowInstance.show();
      this.windowInstance.focus();
    }
  }

  close(): void {
    this.windowInstance.close();
  }

  /**
   * 广播消息
   * @param eventName
   * @param params
   */
  publisher(eventName, params = {}) {
    this.emit(eventName, params);
  }
}
