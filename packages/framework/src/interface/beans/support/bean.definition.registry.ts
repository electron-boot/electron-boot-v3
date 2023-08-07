import { Identifier } from '../../common';
import { IAliasRegistry } from './alias.registry';
import { BeanDefinition } from '../definition/bean.definition';

export interface IBeanDefinitionRegistry {
  aliasRegistry: IAliasRegistry;
  registerDefinition(identifier: Identifier, definition: BeanDefinition): void;
  getSingletonDefinitionIds(): Identifier[];
  getDefinition(identifier: Identifier): BeanDefinition;
  getDefinitionSize(): number;
  getDefinitionByName(name: string): Identifier[];
  removeDefinition(identifier: Identifier): void;
  hasDefinition(identifier: Identifier): boolean;
  registerObject(identifier: Identifier, object: any): void;
  hasObject(identifier: Identifier): boolean;
  getObject(identifier: Identifier): any;
  getObjectSize(): number;
  clearAll(): void;
}
