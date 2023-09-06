import { ConfigFunc, IConfig } from '../interface';

export function defineConfig(config: IConfig | ConfigFunc) {
  return config;
}
