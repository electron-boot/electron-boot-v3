/**
 * 路由信息
 */
export interface EventInfo {
  /**
   * id
   */
  id?: string;
  /**
   * event name
   */
  eventName: string;
  /**
   * handler name
   */
  handlerName: string;
  /**
   * action method
   */
  method: string | ((...args: any[]) => void);
}

export type DynamicEventInfo = Omit<EventInfo, 'id' | 'method'>;
