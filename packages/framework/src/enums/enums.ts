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
