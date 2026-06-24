// Compat shim: restore legacy util type-check helpers removed in modern Node (23+).
// The pinned `config@1.31.0` dependency still calls util.isArray/isRegExp/isDate.
const util = require('util');
if (typeof util.isArray !== 'function') util.isArray = Array.isArray;
if (typeof util.isRegExp !== 'function') util.isRegExp = (v) => v instanceof RegExp;
if (typeof util.isDate !== 'function') util.isDate = (v) => v instanceof Date;
