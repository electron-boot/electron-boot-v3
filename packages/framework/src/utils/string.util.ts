import * as crypto from 'node:crypto';
const rands8Pool = new Uint8Array(256);
let poolPtr = rands8Pool.length;
const byteToHex = initByteToHex();
const UPPERCASE = /[\p{Lu}]/u;
const LOWERCASE = /[\p{Ll}]/u;
const IDENTIFIER = /([\p{Alpha}\p{N}_]|$)/u;
const SEPARATORS = /[_.\- ]+/;
const LEADING_SEPARATORS = new RegExp('^' + SEPARATORS.source);
const SEPARATORS_AND_IDENTIFIER = new RegExp(SEPARATORS.source + IDENTIFIER.source, 'gu');
const NUMBERS_AND_IDENTIFIER = new RegExp('\\d+' + IDENTIFIER.source, 'gu');
function preserveCamelCase(string, toLowerCase, toUpperCase) {
  let isLastCharLower = false;
  let isLastCharUpper = false;
  let isLastLastCharUpper = false;

  for (let index = 0; index < string.length; index++) {
    const character = string[index];

    if (isLastCharLower && UPPERCASE.test(character)) {
      string = string.slice(0, index) + '-' + string.slice(index);
      isLastCharLower = false;
      isLastLastCharUpper = isLastCharUpper;
      isLastCharUpper = true;
      index++;
    } else if (isLastCharUpper && isLastLastCharUpper && LOWERCASE.test(character)) {
      string = string.slice(0, index - 1) + '-' + string.slice(index - 1);
      isLastLastCharUpper = isLastCharUpper;
      isLastCharUpper = false;
      isLastCharLower = true;
    } else {
      isLastCharLower = toLowerCase(character) === character && toUpperCase(character) !== character;
      isLastLastCharUpper = isLastCharUpper;
      isLastCharUpper = toUpperCase(character) === character && toLowerCase(character) !== character;
    }
  }

  return string;
}
export function postProcess(input: string, toUpperCase: any) {
  SEPARATORS_AND_IDENTIFIER.lastIndex = 0;
  NUMBERS_AND_IDENTIFIER.lastIndex = 0;

  return input.replace(SEPARATORS_AND_IDENTIFIER, (_, identifier) => toUpperCase(identifier)).replace(NUMBERS_AND_IDENTIFIER, m => toUpperCase(m));
}
export function camelCaseOrigin(input: string, pascalCase: boolean = false): string {
  input = input.trim();

  if (input.length === 0) {
    return '';
  }

  const toLowerCase = (string: string) => string.toLowerCase();
  const toUpperCase = (string: string) => string.toUpperCase();

  if (input.length === 1) {
    if (SEPARATORS.test(input)) {
      return '';
    }
    return pascalCase ? toUpperCase(input) : toLowerCase(input);
  }

  const hasUpperCase = input !== toLowerCase(input);

  if (hasUpperCase) {
    input = preserveCamelCase(input, toLowerCase, toUpperCase);
  }

  input = input.replace(LEADING_SEPARATORS, '');

  input = toLowerCase(input);

  if (pascalCase) {
    input = toUpperCase(input.charAt(0)) + input.slice(1);
  }

  return postProcess(input, toUpperCase);
}
function initByteToHex() {
  const byteToHex = [];
  for (let i = 0; i < 256; ++i) {
    byteToHex.push((i + 0x100).toString(16).slice(1));
  }
  return byteToHex;
}
function unsafeStringify(arr: Uint8Array | (string | number)[], offset = 0) {
  return (
    byteToHex[arr[offset]] +
    byteToHex[arr[offset + 1]] +
    byteToHex[arr[offset + 2]] +
    byteToHex[arr[offset + 3]] +
    '-' +
    byteToHex[arr[offset + 4]] +
    byteToHex[arr[offset + 5]] +
    '-' +
    byteToHex[arr[offset + 6]] +
    byteToHex[arr[offset + 7]] +
    '-' +
    byteToHex[arr[offset + 8]] +
    byteToHex[arr[offset + 9]] +
    '-' +
    byteToHex[arr[offset + 10]] +
    byteToHex[arr[offset + 11]] +
    byteToHex[arr[offset + 12]] +
    byteToHex[arr[offset + 13]] +
    byteToHex[arr[offset + 14]] +
    byteToHex[arr[offset + 15]]
  ).toLowerCase();
}
export function rng() {
  if (poolPtr > rands8Pool.length - 16) {
    crypto.randomFillSync(rands8Pool);
    poolPtr = 0;
  }
  return rands8Pool.slice(poolPtr, (poolPtr += 16));
}
/**
 * generate uuid
 * @export
 * @param force
 * @returns {string}
 */
export function generateUUID(force?: boolean): string {
  if (!force && crypto['randomUUID']) {
    return crypto['randomUUID']();
  }
  const rnds = rng();
  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  return unsafeStringify(rnds);
}

/**
 * check str is blank or not
 * @param str
 * @returns {boolean}
 */
export function isBlank(str: string): boolean {
  return str === undefined || str == null || str.length <= 0;
}

/**
 * check str is not blank or not
 * @export
 * @param str
 * @returns {boolean}
 */
export function isNotBlank(str: string): boolean {
  return !isBlank(str);
}

/**
 * convert string to camel case string
 * @export
 * @param input
 * @returns {string}
 */
export function camelCase(input: string): string {
  return camelCaseOrigin(input);
}

/**
 * convert string to pascal case string
 * @export
 * @param input
 * @returns {string}
 */
export function pascalCase(input: string): string {
  return camelCaseOrigin(input, true);
}

/**
 * convert string to kebab case string
 * @export
 * @param input
 * @returns {string}
 */
export function kebabCase(input: string): string {
  let temp = input.replace(/[A-Z]/g, i => {
    return '-' + i.toLowerCase();
  });
  if (temp.slice(0, 1) === '-') {
    temp = temp.slice(1);
  }
  return temp;
}
