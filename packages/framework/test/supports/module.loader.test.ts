import { AppModule } from './modulefix/app.module';
import { GenericApplicationContext } from '../../src/context/generic.application.context';
import { EnvironmentService } from '../../src/supports/service/environment.service';
import { ConfigService } from '../../src/supports/service/config.service';
import { ModuleLoader } from '../../src/supports/module.loader';
import { Provide } from '../../src/decorators/provide.decorator';
import { ApplicationContext } from '../../src/decorators/custom.decorator';
import { AspectService } from '../../src/supports/service/aspect.service';
import { DecoratorService } from '../../src/supports/service/decorator.service';
@Provide()
export class Demo {
  @ApplicationContext()
  context: any;
}

describe('/test/support/module.loader.test.ts', () => {
  it('should ', () => {
    const context = new GenericApplicationContext();
    context.register(EnvironmentService);
    context.register(ConfigService);
    context.register(AspectService);
    context.register(DecoratorService);
    context.get(DecoratorService);
    const moduleLoader = new ModuleLoader(context);
    moduleLoader.load(AppModule);
    const configs = context.get(ConfigService).getConfiguration();
    context.register(Demo);
    const demo = context.get(Demo);
    console.log(demo.context);

    console.log(configs);
  });
});
