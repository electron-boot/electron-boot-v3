import { Provide } from '../../src/decorators/provide.decorator';
import { GenericApplicationContext } from '../../src/context/generic.application.context';
import { Autowired } from '../../src/decorators/autowired.decorator';
import { ApplicationContext } from '../../src/decorators/custom.decorator';
import { Singleton } from '../../src/decorators/singleton.decorator';
import { Construct, Init } from '../../src/decorators/definition.decorator';
import { IApplicationContext } from '../../src/interface/context/application.context.interface';

describe('/test/context/generic.application.context.test.ts', () => {
  it('should register object and get it', () => {
    class Animal {
      @Autowired()
      logger: never;
    }
    @Provide()
    class Eye {}
    @Provide()
    class Cat extends Animal {
      @ApplicationContext()
      eye: Eye;
      @Init()
      init() {
        console.log('我进来了');
      }
    }

    const context = new GenericApplicationContext();
    context.register(Cat);
    context.register(Eye);
    context.register('logger', 'test');
    const cat = context.get(Cat);
    expect(cat.logger).toBe('test');
  });
  it('should register object and get async it', async () => {
    class Animal {
      @Autowired()
      logger: any;
    }
    @Provide()
    class Eye {}
    @Provide()
    class Cat extends Animal {
      @Autowired()
      eye: Eye;

      @Autowired('rootContext')
      private applicationContext: IApplicationContext;
      @Init()
      init() {
        console.log(this.applicationContext);
      }
    }

    const context = new GenericApplicationContext();
    context.register(Cat);
    context.register(Eye);
    context.register('logger', 'test');
    const cat = await context.getAsync(Cat);
    expect(cat.logger).toBe('test');
  });
  it('should singleton', async () => {
    class Animal {
      @Autowired()
      logger: never;
    }
    @Singleton
    class Eye {}
    @Singleton
    class Cat extends Animal {
      @Construct
      static construct(): Animal {
        console.log('我是自定义construct');
        return new Cat();
      }

      @Autowired()
      eye: Eye;

      @Init
      init() {
        console.log('我进来了');
      }
    }

    const context = new GenericApplicationContext();
    context.register(Cat);
    context.register(Eye);
    context.register('logger', 'test');
    const cat = context.get(Cat);
    expect(cat.logger).toBe('test');
  });
});
