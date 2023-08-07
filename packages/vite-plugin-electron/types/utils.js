export function resolveHostname(hostname) {
    const loopBackHosts = new Set(['localhost', '127.0.0.1', '::1', '0000:0000:0000:0000:0000:0000:0000:0001']);
    const wildcardHosts = new Set(['0.0.0.0', '::', '0000:0000:0000:0000:0000:0000:0000:0000']);
    return loopBackHosts.has(hostname) || wildcardHosts.has(hostname) ? 'localhost' : hostname;
}
export function resolveServerUrl(server) {
    const addressInfo = server.httpServer.address();
    const isAddressInfo = (x) => x?.address;
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
//# sourceMappingURL=utils.js.map