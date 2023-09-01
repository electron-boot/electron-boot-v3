export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}
export function isNode(): boolean {
  return !isBrowser();
}
export function isElectron(): boolean {
  return isNode() && !!process.versions.electron;
}
export function isWindows(): boolean {
  return isNode() && process.platform === 'win32';
}
export function isMacOS(): boolean {
  return isNode() && process.platform === 'darwin';
}
export function isLinux(): boolean {
  return isNode() && process.platform === 'linux';
}
export function isAndroid(): boolean {
  return isNode() && process.platform === 'android';
}
export function isMainProcess(): boolean {
  return isNode() && process.type === 'browser';
}
export function isWorkerProcess(): boolean {
  return isNode() && process.type === 'worker';
}
export function isRendererProcess(): boolean {
  return isNode() && process.type === 'renderer';
}
