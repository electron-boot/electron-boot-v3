import { BeanDefinition, IAliasRegistry, IBeanDefinitionRegistry } from '../../interface/beans.interface';
import { Identifier } from '../../interface/common.interface';
import { AliasRegistry } from './alias.registry';

export class BeanDefinitionRegistry implements IBeanDefinitionRegistry {
  private _aliasRegistry: IAliasRegistry;
  private objectDefinitions: Map<Identifier, any> = new Map();
  private objectInstances: Map<Identifier, any> = new Map();
  private singletonIds = [];
  get aliasRegistry(): IAliasRegistry {
    if (!this._aliasRegistry) {
      this._aliasRegistry = new AliasRegistry();
    }
    return this._aliasRegistry;
  }

  set aliasRegistry(aliasRegistry: IAliasRegistry) {
    this._aliasRegistry = aliasRegistry;
  }

  clearAll(): void {
    this.singletonIds = [];
    this.objectDefinitions.clear();
    this._aliasRegistry.clearAll();
  }

  getDefinition(identifier: Identifier): BeanDefinition {
    identifier = this.aliasRegistry.getAlias(identifier) ?? identifier;
    return this.objectDefinitions.get(identifier);
  }

  getDefinitionByName(name: string): Identifier[] {
    const definitions = [];
    for (const v of this.objectDefinitions.values()) {
      const definition = v;
      if (definition.name === name) {
        definitions.push(definition);
      }
    }
    return definitions;
  }

  getSingletonDefinitionIds(): Identifier[] {
    return this.singletonIds;
  }

  hasDefinition(identifier: Identifier): boolean {
    identifier = this.aliasRegistry.getAlias(identifier) ?? identifier;
    return this.objectDefinitions.has(identifier);
  }

  registerDefinition(identifier: Identifier, definition: BeanDefinition): void {
    if (definition.isSingletonScope()) {
      this.singletonIds.push(identifier);
    }
    this.objectDefinitions.set(identifier, definition);
    // save alias
    this.aliasRegistry.registerAlias(definition);
  }

  removeDefinition(identifier: Identifier): void {
    this.objectDefinitions.delete(identifier);
    // delete alias
    this.aliasRegistry.removeAlias(identifier);
  }

  registerObject(identifier: Identifier, object: any): void {
    identifier = this.aliasRegistry.getAlias(identifier) ?? identifier;
    this.objectInstances.set(identifier, object);
  }

  getObject(identifier: Identifier): any {
    identifier = this.aliasRegistry.getAlias(identifier) ?? identifier;
    return this.objectInstances.get(identifier);
  }

  getObjectSize(): number {
    return this.objectInstances.size;
  }

  hasObject(identifier: Identifier): boolean {
    identifier = this.aliasRegistry.getAlias(identifier) ?? identifier;
    return this.objectInstances.has(identifier);
  }

  getDefinitionSize(): number {
    return this.objectDefinitions.size;
  }

  setAliasRegistry(aliasRegistry: IAliasRegistry): void {
    this._aliasRegistry = aliasRegistry;
  }
}
