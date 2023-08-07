import { IAliasRegistry } from '../../interface/beans/support/alias.registry';
import { IObjectBeanDefinition } from '../../interface/beans/definition/object.bean.definition';
import { Identifier } from '../../interface/common';

export class AliasRegistry implements IAliasRegistry {
  private aliases: Map<Identifier, Identifier> = new Map();

  setAlias(alias: Identifier, identifier: Identifier): void {
    if (!this.aliases.has(alias)) {
      this.aliases.set(alias, identifier);
    }
  }

  getAlias(alias: Identifier): Identifier {
    return this.aliases.get(alias);
  }

  hasAlias(alias: Identifier): boolean {
    return this.aliases.has(alias);
  }

  registerAlias(definition: IObjectBeanDefinition): void {
    if (definition.id) {
      // save uuid
      this.aliases.set(definition.id, definition.id);
      // save alias id
      const aliasIds = definition.alias;
      if (aliasIds) {
        for (const aliasId of aliasIds) {
          // save alias Id
          this.aliases.set(aliasId, definition.id);
        }
      }
      if (definition.name) {
        // save className alias
        this.aliases.set(definition.name, definition.id);
      }
    }
  }

  removeAlias(identifier: Identifier): void {
    this.aliases.forEach((value, key) => {
      if (value === identifier || key === identifier) {
        this.aliases.delete(key);
      }
    });
  }

  clearAll(): void {
    this.aliases.clear();
  }
}
