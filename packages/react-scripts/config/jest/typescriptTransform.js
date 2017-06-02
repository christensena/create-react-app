// Copyright 2004-present Facebook. All Rights Reserved.

'use strict';

const fs = require('fs');
const crypto = require('crypto');
const tsc = require('typescript');
const babelTransform = require('./babelTransform');
const tsconfigPath = require('app-root-path').resolve('/tsconfig.json');
const THIS_FILE = fs.readFileSync(__filename);

let compilerConfig = {
  module: tsc.ModuleKind.ES6,
  target: tsc.ScriptTarget.ES6,
  moduleResolution: tsc.ModuleResolutionKind.Node,
  allowSyntheticDefaultImports: true,
  jsx: tsc.JsxEmit.Preserve,
  sourceMap: true,
  outDir: './dist/',
};

if (fs.existsSync(tsconfigPath)) {
  try {
    const tsconfig = tsc.readConfigFile(tsconfigPath).config;

    if (tsconfig && tsconfig.compilerOptions) {
      compilerOptions = tsconfig.compilerOptions;
    }
  } catch (e) {
    /* Do nothing - default is set */
  }
}

module.exports = {
  process(src, path, config, options) {
    const isTs = path.endsWith('.ts');
    const isTsx = path.endsWith('.tsx');

    if (isTs || isTsx) {
      let compilerOptions = compilerConfig;
      if (options.instrument) {
        // inline source with source map for remapping coverage
        compilerOptions = Object.assign({}, compilerConfig);
        delete compilerOptions.sourceMap;
        compilerOptions.inlineSourceMap = true;
        compilerOptions.inlineSources = true;
        // fix broken paths in coverage report if `.outDir` is set
        delete compilerOptions.outDir;
      }
      src = tsc.transpileModule(src, {
        compilerOptions,
        fileName: path,
      });
      src = src.outputText;

      // update the path so babel can try and process the output
      path = path.substr(0, path.lastIndexOf('.')) + (isTs ? '.js' : '.jsx') ||
        path;
    }

    if (path.endsWith('.js') || path.endsWith('.jsx')) {
      src = babelTransform.process(src, path);
    }

    return src;
  },
  getCacheKey(fileData, filePath, configStr, options) {
    return crypto
      .createHash('md5')
      .update(THIS_FILE)
      .update('\0', 'utf8')
      .update(fileData)
      .update('\0', 'utf8')
      .update(filePath)
      .update('\0', 'utf8')
      .update(configStr)
      .update('\0', 'utf8')
      .update(JSON.stringify(compilerConfig))
      .update('\0', 'utf8')
      .update(options.instrument ? 'instrument' : '')
      .digest('hex');
  },
};
