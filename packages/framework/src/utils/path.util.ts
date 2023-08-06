import { posix } from 'path';

export class PathUtil {
  static joinURLPath(...strArray) {
    strArray = strArray.filter(item => !!item);
    if (strArray.length === 0) {
      return '';
    }
    let p = posix.join(...strArray);
    p = p.replace(/\/+$/, '');
    if (!/^\//.test(p)) {
      p = '/' + p;
    }
    return p;
  }
}
