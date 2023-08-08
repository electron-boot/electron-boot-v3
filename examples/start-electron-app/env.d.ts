export {};
declare global {
  let ipc: import('electron').IpcRenderer;
}
declare interface window {
  ipc: import('electron').IpcRenderer;
}
