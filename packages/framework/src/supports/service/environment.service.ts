import { app } from 'electron';
import { Singleton } from '../../decorators/singleton.decorator';

@Singleton()
export class EnvironmentService {
  private environment: string;
  getEnvironment(): string {
    if (!this.environment) {
      this.environment = app.isPackaged ? 'production' : 'development';
    }
    return this.environment;
  }
  isDevelopment(): boolean {
    return this.getEnvironment() === 'development';
  }
}
