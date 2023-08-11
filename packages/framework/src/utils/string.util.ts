import * as crypto from 'crypto';
export class StringUtil {
  private static rands8Pool = new Uint8Array(256);
  private static poolPtr = this.rands8Pool.length;
  private static byteToHex = this.initByteToHex();
  private static UPPERCASE = /[\p{Lu}]/u;
  private static LOWERCASE = /[\p{Ll}]/u;
  private static IDENTIFIER = /([\p{Alpha}\p{N}_]|$)/u;
  private static SEPARATORS = /[_.\- ]+/;
  private static LEADING_SEPARATORS = new RegExp('^' + this.SEPARATORS.source);
  private static SEPARATORS_AND_IDENTIFIER = new RegExp(this.SEPARATORS.source + this.IDENTIFIER.source, 'gu');
  private static NUMBERS_AND_IDENTIFIER = new RegExp('\\d+' + this.IDENTIFIER.source, 'gu');
  private static preserveCamelCase(string, toLowerCase, toUpperCase) {
    let isLastCharLower = false;
    let isLastCharUpper = false;
    let isLastLastCharUpper = false;

    for (let index = 0; index < string.length; index++) {
      const character = string[index];

      if (isLastCharLower && this.UPPERCASE.test(character)) {
        string = string.slice(0, index) + '-' + string.slice(index);
        isLastCharLower = false;
        isLastLastCharUpper = isLastCharUpper;
        isLastCharUpper = true;
        index++;
      } else if (isLastCharUpper && isLastLastCharUpper && this.LOWERCASE.test(character)) {
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
  private static postProcess(input: string, toUpperCase: any) {
    this.SEPARATORS_AND_IDENTIFIER.lastIndex = 0;
    this.NUMBERS_AND_IDENTIFIER.lastIndex = 0;

    return input
      .replace(this.SEPARATORS_AND_IDENTIFIER, (_, identifier) => toUpperCase(identifier))
      .replace(this.NUMBERS_AND_IDENTIFIER, m => toUpperCase(m));
  }
  private static camelCaseOrigin(input: string, pascalCase: boolean = false): string {
    input = input.trim();

    if (input.length === 0) {
      return '';
    }

    const toLowerCase = (string: string) => string.toLowerCase();
    const toUpperCase = (string: string) => string.toUpperCase();

    if (input.length === 1) {
      if (this.SEPARATORS.test(input)) {
        return '';
      }
      return pascalCase ? toUpperCase(input) : toLowerCase(input);
    }

    const hasUpperCase = input !== toLowerCase(input);

    if (hasUpperCase) {
      input = this.preserveCamelCase(input, toLowerCase, toUpperCase);
    }

    input = input.replace(this.LEADING_SEPARATORS, '');

    input = toLowerCase(input);

    if (pascalCase) {
      input = toUpperCase(input.charAt(0)) + input.slice(1);
    }

    return this.postProcess(input, toUpperCase);
  }
  private static initByteToHex() {
    const byteToHex = [];
    for (let i = 0; i < 256; ++i) {
      byteToHex.push((i + 0x100).toString(16).slice(1));
    }
    return byteToHex;
  }
  private static unsafeStringify(arr: Uint8Array | (string | number)[], offset = 0) {
    return (
      this.byteToHex[arr[offset]] +
      this.byteToHex[arr[offset + 1]] +
      this.byteToHex[arr[offset + 2]] +
      this.byteToHex[arr[offset + 3]] +
      '-' +
      this.byteToHex[arr[offset + 4]] +
      this.byteToHex[arr[offset + 5]] +
      '-' +
      this.byteToHex[arr[offset + 6]] +
      this.byteToHex[arr[offset + 7]] +
      '-' +
      this.byteToHex[arr[offset + 8]] +
      this.byteToHex[arr[offset + 9]] +
      '-' +
      this.byteToHex[arr[offset + 10]] +
      this.byteToHex[arr[offset + 11]] +
      this.byteToHex[arr[offset + 12]] +
      this.byteToHex[arr[offset + 13]] +
      this.byteToHex[arr[offset + 14]] +
      this.byteToHex[arr[offset + 15]]
    ).toLowerCase();
  }
  private static rng() {
    if (this.poolPtr > this.rands8Pool.length - 16) {
      crypto.randomFillSync(this.rands8Pool);
      this.poolPtr = 0;
    }
    return this.rands8Pool.slice(this.poolPtr, (this.poolPtr += 16));
  }
  /**
   * generate uuid
   * @export
   * @param force
   * @returns {string}
   */
  static generateUUID(force?: boolean): string {
    if (!force && crypto['randomUUID']) {
      return crypto['randomUUID']();
    }
    const rnds = this.rng();
    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;

    return this.unsafeStringify(rnds);
  }

  /**
   * check str is blank or not
   * @param str
   * @returns {boolean}
   */
  static isBlank(str: string): boolean {
    return str === undefined || str == null || str.length <= 0;
  }

  /**
   * check str is not blank or not
   * @export
   * @param str
   * @returns {boolean}
   */
  static isNotBlank(str: string): boolean {
    return !this.isBlank(str);
  }

  /**
   * convert string to camel case string
   * @export
   * @param input
   * @returns {string}
   */
  static camelCase(input: string): string {
    return this.camelCaseOrigin(input);
  }

  /**
   * convert string to pascal case string
   * @export
   * @param input
   * @returns {string}
   */
  static pascalCase(input: string): string {
    return this.camelCaseOrigin(input, true);
  }

  /**
   * convert string to kebab case string
   * @export
   * @param input
   * @returns {string}
   */
  static kebabCase(input: string): string {
    let temp = input.replace(/[A-Z]/g, i => {
      return '-' + i.toLowerCase();
    });
    if (temp.slice(0, 1) === '-') {
      temp = temp.slice(1);
    }
    return temp;
  }
}
