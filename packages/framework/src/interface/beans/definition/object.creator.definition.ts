export interface IObjectCreatorDefinition {
  /**
   * load beans target
   */
  load(): any;

  /**
   * execute beans construction
   * @param clazz
   * @param args
   */
  doConstruct(clazz: any, args?: any[]): any;

  /**
   * execute beans construction async
   * @param clazz
   * @param args
   */
  doConstructAsync(clazz: any, args?: any[]): Promise<any>;

  /**
   * execute beans initialization
   * @param obj
   * @param args
   */
  doInit(obj: any, ...args: any[]): void;

  /**
   * execute beans initialization async
   * @param obj
   * @param args
   */
  doInitAsync(obj: any, ...args: any[]): Promise<void>;

  /**
   * execute beans destruction
   * @param obj
   * @param args
   */
  doDestroy(obj: any, ...args: any[]): void;

  /**
   * execute beans destruction async
   * @param obj
   * @param args
   */
  doDestroyAsync(obj: any, ...args: any[]): Promise<void>;
}
