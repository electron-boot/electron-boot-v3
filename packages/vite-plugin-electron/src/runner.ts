import path = require('node:path');
import * as fs from 'node:fs';
require('ts-node').register();
const userRunner = require.resolve(path.join(process.cwd(), process.argv[2]));
console.log(userRunner);
const stats = fs.statSync(userRunner);
if (stats.isFile()) {
  require(userRunner);
}
