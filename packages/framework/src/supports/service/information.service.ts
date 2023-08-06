import { join } from 'path';
import { app } from 'electron';
import { Singleton } from '../../decorators/singleton.decorator';
import * as fs from 'fs';

@Singleton()
export class InformationService {
  private pkg: Record<string, unknown>;
  private appPath: string;
  private homePath: string;

  getAppPath(): string {
    if (!this.appPath) {
      this.appPath = app.getAppPath();
    }
    return this.appPath;
  }

  getUserHome(): string {
    if (!this.homePath) {
      this.homePath = app.getPath('home');
    }
    return this.homePath;
  }

  getPkg(): Record<string, unknown> {
    if (!this.pkg) {
      if (this.getAppPath()) {
        const path = join(this.getAppPath(), 'package.json');
        const isExits = fs.existsSync(path);
        this.pkg = isExits ? require(path) : {};
      } else {
        this.pkg = {};
      }
    }
    return this.pkg;
  }

  getName(): string {
    return (this.getPkg().name as string) || '';
  }

  getVersion(): string {
    return this.getPkg().version as string;
  }

  getDescription(): string {
    return this.getPkg().description as string;
  }
}
