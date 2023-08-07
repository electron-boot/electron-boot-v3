import { Identifier } from '../../common';
import { Scope } from '../../../enums/enums';
import { IApplicationContext } from '../../context/application.context.interface';

export interface FactoryInfoDefinition {
  identifier: Identifier;
  provider: (context: IApplicationContext, args?: any) => any;
  scope?: Scope;
}
