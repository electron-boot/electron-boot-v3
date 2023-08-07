import { Identifier } from '../../common';
import { IObjectBeanDefinition } from '../definition/object.bean.definition';

export interface IAliasRegistry {
  registerAlias(definition: IObjectBeanDefinition): void;
  removeAlias(identifier: Identifier): void;
  hasAlias(alias: Identifier): boolean;
  getAlias(alias: Identifier): Identifier;
  setAlias(alias: Identifier, identifier: Identifier): void;
  clearAll(): void;
}
