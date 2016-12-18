const tsc = require('typescript');

const compilerOptions = {
  module: tsc.ModuleKind.CommonJS,
  jsx: tsc.JsxEmit.React,
};

// transpile the source with TypeScript
module.exports = {
  process(src, path) {
    if (path.endsWith('.ts') || path.endsWith('.tsx')) {
      return tsc.transpile(
        src,
        compilerOptions,
        path, []
      );
    }
    return src;
  }
};