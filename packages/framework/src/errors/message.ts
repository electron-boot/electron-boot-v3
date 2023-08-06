import { Identifier } from '../interface/common.interface';

export const USE_WRONG_METHOD_MESSAGE = (wrongMethod: string, replacedMethod: string, describeKey?: Identifier) => {
  return describeKey
    ? `${describeKey?.toString()} not valid by ${wrongMethod}, Use ${replacedMethod} instead!`
    : `You should not invoked by ${wrongMethod}, Use ${replacedMethod} instead!`;
};

export const NOT_FOUND_MESSAGE = (identifier?: Identifier) => {
  return `${identifier.toString} is not valid in current context`;
};

export const SINGULAR_INJECT_REQUEST_MESSAGE = (singletonScopeName: string, requestScopeName: string) => {
  return (
    `${singletonScopeName} with singleton scope can't implicitly inject ${requestScopeName} with request scope directly,` +
    ' please add "@Scope(ScopeEnum.Request,' +
    ` { allowDowngrade: true })" in ${requestScopeName} or use "ctx.requestContext.getAsync(${requestScopeName})".`
  );
};

export const MISSING_IMPORT_MESSAGE = (originName: Identifier) => {
  return `"${originName.toString()}" can't inject and maybe forgot add "{imports: [***]}" in @Configuration.`;
};
