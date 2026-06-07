const Module = require('module');

// Intercept 'server-only' require to prevent it from throwing errors in standalone Node
const originalRequire = Module.prototype.require;
Module.prototype.require = function (id) {
  if (id === 'server-only') {
    return {};
  }
  return originalRequire.apply(this, arguments);
};

// Require the actual seed-admin TS file
require('./seed-admin.ts');
