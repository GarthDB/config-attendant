import fs from 'fs';
import ini from 'ini';
import path from 'path';
import stripJsonComments from 'strip-json-comments';

const utils = {
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
  parse: (content) => {
    // if it ends in .json or starts with { then it must be json.
    // must be done this way, because ini accepts everything.
    // can't just try and parse it and let it throw if it's not ini.
    // everything is ini. even json with a syntax error.

    if (/^\s*{/.test(content)) return JSON.parse(stripJsonComments(content));
    return ini.parse(content);
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
  file: (segments) => {
    if (!segments) return null;
    const filepath = path.join(segments);
    try {
      return fs.readFileSync(filepath, 'utf-8');
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
  json: (filepath) => {
    const content = utils.file(filepath);
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
  env: (prefix, envObj = process.env) => {
    const obj = {};
    const l = prefix.length;

    Object.keys(envObj).forEach((k) => {
      if ((k.indexOf(prefix)) === 0) {
        const keypath = k.substring(l).split('__');
        // Trim empty strings from keypath array
        let _emptyStringIndex = keypath.indexOf('');
        while (_emptyStringIndex > -1) {
          keypath.splice(_emptyStringIndex, 1);
          _emptyStringIndex = keypath.indexOf('');
        }
        let cursor = obj;
        keypath.forEach((_subkey, i) => {
          // (check for _subkey first so we ignore empty strings)
          // (check for cursor to avoid assignment to primitive objects)
          if (!_subkey || typeof cursor !== 'object') return;
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
  find: (filename, start = process.cwd()) => {
    const filepath = path.join(start, filename);
    try {
      fs.statSync(filepath);
      return filepath;
    } catch (err) {
      if (path.dirname(start) !== start) { // root
        return utils.find(filename, path.dirname(start));
      }
    }
    return null;
  },
};

export default utils;
