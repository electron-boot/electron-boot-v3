const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const { defineConfig } = require('rollup');
const path = require('path');
const pkg = require('./package.json');
const json = require('@rollup/plugin-json');
const nodeResolve = require('@rollup/plugin-node-resolve');
const clean = require('@rollup-extras/plugin-clean');
const { dts } = require('rollup-plugin-dts');
const resolve = function (...args) {
  return path.resolve(__dirname, ...args);
};
const external = Object.keys(pkg.dependencies || {});
external.push('electron', 'tsc-watch');
const input = 'src/index.ts';
module.exports = defineConfig([
  {
    input,
    output: [
      {
        file: resolve('./', pkg.exports.import),
        format: 'esm',
        sourcemap: true,
      },
      {
        file: resolve('./', pkg.exports.require),
        format: 'cjs',
        sourcemap: true,
      },
    ],
    external: external,
    plugins: [clean(['lib']), nodeResolve(), typescript(), commonjs(), json()],
  },
  {
    input,
    plugins: [dts(), nodeResolve(), commonjs(), json()],
    output: {
      format: 'esm',
      file: resolve('./', pkg.types),
    },
  },
]);
