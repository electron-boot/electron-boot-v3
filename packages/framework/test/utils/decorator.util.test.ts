import { StringUtil } from '../../src/utils/string.util';
import { DecoratorUtil } from '../../src/utils/decorator.util';
import { Provide } from '../../src/decorators/provide.decorator';
import { Scope } from '../../src/enums/enums';

describe('/test/utils/beans.util.test.ts', () => {
  @Provide({
    scope: Scope.Singleton,
  })
  class Cat {}
  it('should test getBeanDefinition', () => {
    const beanDefinition = DecoratorUtil.getBeanDefinition(Cat);
    expect(beanDefinition).toHaveProperty('target', Cat);
    expect(beanDefinition).toHaveProperty('id');
    expect(beanDefinition).toHaveProperty('name', StringUtil.camelCase(Cat.name));
    expect(beanDefinition).toHaveProperty('originName', Cat.name);
    expect(beanDefinition).toHaveProperty('scope', Scope.Singleton);
  });
});
