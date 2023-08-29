import { BrowserWindow } from 'electron';
import { LoggerFactory } from '@electron-boot/logger/src';
import { WindowReadyState } from '../enums/enums';

export abstract class AbstractWindow {
  protected logger = LoggerFactory.getLogger(this);
  protected _id: number;
  protected _win: BrowserWindow;
  protected readyState = WindowReadyState.NONE;
  get isReady() {
    return this.readyState === WindowReadyState.READY;
  }
  send(channel: string, ...args: any[]): void {
    if (this._win) {
      if (this._win.isDestroyed() || this._win.webContents.isDestroyed()) {
        this.logger.warn(`Sending IPC message to channel '${channel}' for window that is destroyed`);
        return;
      }
      try {
        this._win.webContents.send(channel, ...args);
      } catch (error) {
        this.logger.warn(`Error sending IPC message to channel '${channel}' of window ${this._id}: ${error}`);
      }
    }
  }
  close(): void {
    this._win?.close();
  }
}
