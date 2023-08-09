import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
export interface BrowserWindowOptions extends BrowserWindowConstructorOptions {
  /**
   * lazy load
   */
  lazyLoad?: boolean;
  /**
   * load url
   */
  url?: string;
}
export interface IBrowserWindow {
  /**
   * The window id
   * @returns {number}
   */
  id: number;
  /**
   * The window can close
   * @returns {boolean}
   */
  getCanClose(): boolean;

  /**
   * disable close
   */
  disableClose(): void;

  /**
   * enable close
   */
  enableClose(): void;

  /**
   * get window instance
   * @returns {BrowserWindow}
   */
  getInstance(): BrowserWindow;

  /**
   * add event listener
   * @param eventName
   * @param listener
   */
  on(eventName: string, listener: Function): void;

  /**
   * add event listener of once
   * @param eventName
   * @param listener
   */
  once(eventName: string, listener: Function): void;

  /**
   * restore window
   */
  restore(): void;

  /**
   * show window
   */
  show(): void;

  /**
   * hide window
   */
  hide(): void;

  /**
   * open window
   * @returns {Promise<BrowserWindow>}
   */
  open(): Promise<BrowserWindow>;

  /**
   * close window
   */
  close(): void;
}
