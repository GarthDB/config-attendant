'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _ini = require('ini');

var _ini2 = _interopRequireDefault(_ini);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _stripJsonComments = require('strip-json-comments');

var _stripJsonComments2 = _interopRequireDefault(_stripJsonComments);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var utils = {
  /**
   *  Public: parses content if it is json or ini data.
   *
   *  * `content` {String} configuration data.
   *
   *  ## Examples
   *
   *  ```js
   *  var cc = require('config-attendant/lib/utils');
   *  var configObj = cc.parse(fs.readFileSync('file.json', 'utf-8'));
   *  ```
   *
   *  Returns {Object} configuration keys and values.
   */
  parse: function parse(content) {
    // if it ends in .json or starts with { then it must be json.
    // must be done this way, because ini accepts everything.
    // can't just try and parse it and let it throw if it's not ini.
    // everything is ini. even json with a syntax error.

    if (/^\s*{/.test(content)) return JSON.parse((0, _stripJsonComments2.default)(content));
    return _ini2.default.parse(content);
  },

  /**
   *  Public: joins segments and reads file.
   *
   *  * `segments` {String} or {Array} of {Strings} passed to `path.join`
   *
   *  ## Examples
   *
   *  ```js
   *  var cc = require('config-attendant/lib/utils');
   *  var content = cc.file('string-to-file.ini');
   *  ```
   *
   *  Returns {String} file contents.
   *  Return {null} if file is not found.
   */
  file: function file(segments) {
    if (!segments) return null;
    var filepath = _path2.default.join(segments);
    try {
      return _fs2.default.readFileSync(filepath, 'utf-8');
    } catch (err) {
      return null;
    }
  },

  /**
   *  Public: reads and parses json file.
   *
   *  * `filepath` {String} or {Array} of {Strings} passed to `path.join`
   *
   *  ## Examples
   *
   *  ```js
   *  var cc = require('config-attendant/lib/utils');
   *  var jsonObj = cc.json('string-to-file.json');
   *  ```
   *
   *  Returns parsed config {Object}
   */
  json: function json(filepath) {
    var content = utils.file(filepath);
    return content ? utils.parse(content) : null;
  },

  /**
   *  Public: gathers all the env variables containing the correct prefix and parses
   *  sub objects based on env name strings.
   *
   *  * `prefix` {String} config appname.
   *  * `envObj` (Optional) {Object} containing the user environment variables.
   *
   *  ## Examples
   *
   *  ```js
   *  process.env['app_someOpt__a'] = 42;
   *  process.env['app_someOpt__x__'] = 99;
   *  process.env['app_someOpt__a__b'] = 186;
   *  process.env['app_someOpt__a__b__c'] = 243;
   *  process.env['app_someOpt__x__y'] = 1862;
   *  process.env['app_someOpt__z'] = 186577;
   *  var cc = require('./lib/utils');
   *  console.log(cc.env('app'+'_'));
   *  // { someOpt: { a: '42', x: '99', z: '186577' } }
   *  ```
   *
   *  Returns {Object} of env variables together.
   */
  env: function env(prefix) {
    var envObj = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : process.env;

    var obj = {};
    var l = prefix.length;

    Object.keys(envObj).forEach(function (k) {
      if (k.indexOf(prefix) === 0) {
        var keypath = k.substring(l).split('__');
        // Trim empty strings from keypath array
        var _emptyStringIndex = keypath.indexOf('');
        while (_emptyStringIndex > -1) {
          keypath.splice(_emptyStringIndex, 1);
          _emptyStringIndex = keypath.indexOf('');
        }
        var cursor = obj;
        keypath.forEach(function (_subkey, i) {
          // (check for _subkey first so we ignore empty strings)
          // (check for cursor to avoid assignment to primitive objects)
          if (!_subkey || (typeof cursor === 'undefined' ? 'undefined' : _typeof(cursor)) !== 'object') return;
          // If this is the last key, just stuff the value in there
          // Assigns actual value from env variable to final key
          // (unless it's just an empty string- in that case use the last valid key)
          if (i === keypath.length - 1) cursor[_subkey] = envObj[k];
          // Build sub-object if nothing already exists at the keypath
          if (cursor[_subkey] === undefined) cursor[_subkey] = {};
          // Increment cursor used to track the object at the current depth
          cursor = cursor[_subkey];
        });
      }
    });
    return obj;
  },

  /**
   *  Public: finds file in current directory or in any parent directory until arriving at root.
   *
   *  * `filename` {String} of file to find.
   *  * `start` (Optional) {String} of starting directory.
   *
   *  ## Examples
   *
   *  ```js
   *  var cc = require('config-attendant/lib/utils');
   *  var configFilePath = cc.find('string-to-file.ini');
   *  ```
   *
   *  Returns {String} of path to file if found.
   *  Returns {null} if file not found.
   */
  find: function find(filename) {
    var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : process.cwd();

    var filepath = _path2.default.join(start, filename);
    try {
      _fs2.default.statSync(filepath);
      return filepath;
    } catch (err) {
      if (_path2.default.dirname(start) !== start) {
        // root
        return utils.find(filename, _path2.default.dirname(start));
      }
    }
    return null;
  }
};

exports.default = utils;
module.exports = exports['default'];