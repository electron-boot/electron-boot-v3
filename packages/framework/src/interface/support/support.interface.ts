import { InjectMode } from '../../enums/enums';
import { ClassType } from '../common';

export interface ResolveOptions {
  type: string;
  injectMode: InjectMode;
  provider: any;
  [key: string]: any;
}

export interface ResolveFactory {
  getName(): string;
  resolve(options: ResolveOptions, originName: string): any;
  resolveAsync(options: ResolveOptions, originName: string): Promise<any>;
}

export interface AppInfo {
  runnerPath: string;
  name: string;
  version: string;
  HOME: string;
  env: string;
}

export interface JoinPoint {
  methodName: string;
  target: any;
  args: any[];
  proceed?(...args: any[]): any;
  proceedIsAsyncFunction?: boolean;
}

export interface AspectMetadata {
  aspectTarget: any;
  match?: string | (() => boolean);
  priority?: number;
}

export interface IMethodAspect {
  after?(joinPoint: JoinPoint, result: any, error: Error): void;
  afterReturn?(joinPoint: JoinPoint, result: any): any;
  afterThrow?(joinPoint: JoinPoint, error: Error): void;
  before?(joinPoint: JoinPoint): void;
  around?(joinPoint: JoinPoint): any;
}

export type HandlerFunction = (key: string | symbol, meta: any, instance: any) => any;

export type MethodHandlerFunction = (options: { target: ClassType; propertyName: string; metadata: any }) => IMethodAspect;

export interface ISocket {
  getName(): string;
  isEnable(): boolean;
  run(): Promise<void>;
  stop(): Promise<void>;
}

export interface IServiceFactory<Client> {
  get(clientId: string): Client;
  has(clientId: string): boolean;
  createInstance(config: any, clientId?: string): Client | undefined;
  createInstanceAsync(config: any, clientId?: string): Promise<Client | undefined>;
  getName(): string;
  stop(): void;
  stopAsync(): Promise<void>;
  getDefaultClientName(): string;
}
