import { IServiceFactory } from '../../interface/support.interface';
import { ObjectUtil } from '../../utils/object.util';

export abstract class AbstractServiceFactory<T> implements IServiceFactory<T> {
  protected clients: Map<string, T> = new Map();
  protected options = {};
  public get<U = T>(id = 'default'): U {
    return this.clients.get(id) as unknown as U;
  }

  public has(id: string): boolean {
    return this.clients.has(id);
  }

  public abstract getName(): string;
  protected abstract createClient(config: any, clientName: string): T | void;
  protected abstract createClientAsync(config: any, clientName: string): Promise<T> | Promise<void>;
  protected abstract destroyClient(client: T): void;
  protected abstract destroyClientAsync(client: T): Promise<void>;

  /**
   * init Clients
   * @param options
   * @protected
   */
  protected async initClients(options: any = {}): Promise<void> {
    this.options = options;
    // 获取默认配置
    const defaultOption = this.options['default'] || {};
    // 多实例初始化
    for (const id of Object.keys(options)) {
      if (id !== 'default') await this.createInstanceAsync(ObjectUtil.extend(true, {}, defaultOption, options[id]), id);
    }
  }

  /**
   * create instance
   * @param config
   * @param clientName
   */
  createInstance(config: any, clientName: string): T {
    config = ObjectUtil.extend(true, {}, this.options['default'], config);
    const client = this.createClient(config, clientName);
    if (client) {
      if (clientName) {
        this.clients.set(clientName, client);
      }
      return client;
    }
  }

  /**
   * create instance async
   * @param config
   * @param clientName
   */
  async createInstanceAsync(config: any, clientName: string): Promise<T | undefined> {
    config = ObjectUtil.extend(true, {}, this.options['default'], config);
    const client = await this.createClientAsync(config, clientName);
    if (client) {
      if (clientName) {
        this.clients.set(clientName, client);
      }
      return client;
    }
  }

  /**
   * stop Clients
   */
  stop(): void {
    for (const value of this.clients.values()) {
      this.destroyClient(value);
    }
  }

  /**
   * stop Clients async
   */
  async stopAsync(): Promise<void> {
    for (const value of this.clients.values()) {
      await this.destroyClientAsync(value);
    }
  }
  getDefaultClientName(): string {
    return this.options['defaultClientName'];
  }
}
