export enum Kind {
  Class = 'class',
  Factory = 'factory',
}
export enum Scope {
  Singleton = 'Singleton',
  Request = 'Request',
  Prototype = 'Prototype',
}
export enum InjectMode {
  Identifier = 'Identifier',
  Class = 'Class',
  PropertyKey = 'PropertyKey',
}
export enum ObjectLifeCycle {
  BEFORE_BIND = 'beforeBind',
  BEFORE_CREATED = 'beforeObjectCreated',
  AFTER_CREATED = 'afterObjectCreated',
  AFTER_INIT = 'afterObjectInit',
  BEFORE_DESTROY = 'beforeObjectDestroy',
}
export enum WindowReadyState {
  /**
   * This window has not loaded anything yet
   * and this is the initial state of every
   * window.
   */
  NONE,

  /**
   * This window is navigating, either for the
   * first time or subsequent times.
   */
  NAVIGATING,

  /**
   * This window has finished loading and is ready
   * to forward IPC requests to the web contents.
   */
  READY,
}
