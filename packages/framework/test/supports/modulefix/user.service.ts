import { Provide } from '../../../src/decorators/provide.decorator';
import { Autowired } from '../../../src/decorators/autowired.decorator';

@Provide()
export class UserService {
  @Autowired()
  logger: any;
}
