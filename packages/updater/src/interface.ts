import { AllPublishOptions, ProgressInfo, PublishConfiguration, UpdateInfo } from 'builder-util-runtime';
export interface AutoUpdate {
  options: PublishConfiguration | AllPublishOptions | string;
  autoCheck: boolean;
  force: boolean;
  windows: boolean;
  macOS: boolean;
  linux: boolean;
}

declare module '@electron-boot/framework' {
  interface ElectronBootConfig {
    autoUpdater?: AutoUpdate;
  }
}

export interface EventData {
  eventType: EventType;
  updateInfo?: UpdateInfo;
  progressInfo?: ProgressInfo;
  errorInfo?: ErrorInfo;
  downloadedInfo?: DownloadedInfo;
}

export interface ErrorInfo {
  message: string;
  error: Error;
}
export interface DownloadedInfo {
  [key: string]: any;
}
export enum EventType {
  error = -1,
  checking = 1,
  available,
  noAvailable,
  progress,
  downloaded,
}
