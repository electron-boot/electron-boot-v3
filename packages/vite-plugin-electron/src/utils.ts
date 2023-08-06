import type { AddressInfo } from 'node:net';
import { ViteDevServer } from 'vite';
export function resolveHostname(hostname: string) {
  const loopBackHosts = new Set(['localhost', '127.0.0.1', '::1', '0000:0000:0000:0000:0000:0000:0000:0001']);
  const wildcardHosts = new Set(['0.0.0.0', '::', '0000:0000:0000:0000:0000:0000:0000:0000']);
  return loopBackHosts.has(hostname) || wildcardHosts.has(hostname) ? 'localhost' : hostname;
}
export function resolveServerUrl(server: ViteDevServer): string | void {
  const addressInfo = server.httpServer!.address();
  const isAddressInfo = (x: any): x is AddressInfo => x?.address;

  if (isAddressInfo(addressInfo)) {
    const { address, port } = addressInfo;
    const hostname = resolveHostname(address);

    const options = server.config.server;
    const protocol = options.https ? 'https' : 'http';
    const devBase = server.config.base;

    const path = typeof options.open === 'string' ? options.open : devBase;
    const url = path.startsWith('http') ? path : `${protocol}://${hostname}:${port}${path}`;

    return url;
  }
}
