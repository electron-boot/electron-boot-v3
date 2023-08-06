import { StringUtil } from '../../src/utils/string.util';
describe('/test/utils/string.util.test.ts', () => {
  it('should test camelcase', () => {
    expect('helloWorld').toStrictEqual(StringUtil.camelCase('hello_world'));
  });
  it('should test pascalcase', () => {
    expect('HelloWorld').toStrictEqual(StringUtil.pascalCase('hello_world'));
  });
});
