(Symbol as any).metadata ??= Symbol('Symbol.metadata');
(Symbol as any).dispose ??= Symbol('Symbol.dispose');
(Symbol as any).asyncDispose ??= Symbol('Symbol.asyncDispose');
export const SymbolMetadata = (Symbol as any).metadata;
export const SymbolDispose = (Symbol as any).dispose;
export const SymbolAsyncDispose = (Symbol as any).asyncDispose;
