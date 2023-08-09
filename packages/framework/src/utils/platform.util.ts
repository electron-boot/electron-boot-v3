export class PlatformUtil {
  static isBrowser(): boolean {
    return typeof window !== 'undefined';
  }
  static isNode(): boolean {
    return !PlatformUtil.isBrowser();
  }
  static isElectron(): boolean {
    return PlatformUtil.isNode() && !!process.versions.electron;
  }
  static isWindows(): boolean {
    return PlatformUtil.isNode() && process.platform === 'win32';
  }
  static isMacOS(): boolean {
    return PlatformUtil.isNode() && process.platform === 'darwin';
  }
  static isLinux(): boolean {
    return PlatformUtil.isNode() && process.platform === 'linux';
  }
  static isAndroid(): boolean {
    return PlatformUtil.isNode() && process.platform === 'android';
  }
  static isMainProcess(): boolean {
    return PlatformUtil.isNode() && process.type === 'browser';
  }
  static isWorkerProcess(): boolean {
    return PlatformUtil.isNode() && process.type === 'worker';
  }
  static isRendererProcess(): boolean {
    return PlatformUtil.isNode() && process.type === 'renderer';
  }
}
