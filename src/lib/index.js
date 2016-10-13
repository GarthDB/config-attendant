import { join } from 'path';
import deepExtend from 'deep-extend';
import cc from './utils';

const etc = '/etc';
const win = process.platform === 'win32';
const home = win
           ? process.env.USERPROFILE
           : process.env.HOME;

const minimist = require('minimist')(process.argv.slice(2));

/**
 *  Private: reads and parses config files, and adds them to the configs array.
 *
 *  * `file` {String} path to file to read and parse.
 *  * `configs` {Array} of config {Objects}.
 *  * `configFiles` {Array} of config file paths {Strings}.
 *  * `parse` {Function} used to parse config files.
 */
function _addConfigFile(file, configs, configFiles, parse) {
  if (!configFiles.includes(file)) {
    const fileConfig = cc.file(file);
    if (fileConfig) {
      configs.push(parse(fileConfig));
      configFiles.push(file);
    }
  }
}

/**
 *  Private: finds the closest package.json file, and adds corresponding config
 *  data to the configs array.
 *
 *  * `places` {Array} of {Strings} that correspond potential properties in the
 *    package.json data that contain config data.
 *  * `configs` {Array} of config {Objects}.
 *
 *  Returns {String} of path to package.json file.
 */
function _addPackageJSON(places, configs) {
  const packageFile = cc.find('package.json');
  if (packageFile) {
    const packageJSON = cc.json(packageFile);
    places.forEach(place => {
      if ({}.hasOwnProperty.call(packageJSON, 'config') &&
        {}.hasOwnProperty.call(packageJSON.config, place)) {
        configs.push(packageJSON.config[place]);
      }
      if ({}.hasOwnProperty.call(packageJSON, place)) {
        configs.push(packageJSON[place]);
      }
    });
  }
  return packageFile;
}

/**
 *  Public: loads config from multiple sources and combines them in an expected order.
 *
 *  * `name` {String} name of the app or process that is used to identify which
 *    config files to load.
 *  * `defaults` (optional) {Object} default values to load in.
 *  * `argv` (optional) {Function} custom argv parser, defaults to
 *    [minimist](https://www.npmjs.com/package/minimist) if none is provided.
 *  * `parse` (optional) {Function} custom parser, if none is provided, defaults
 *    to utils.parse.
 *
 *  ## Examples
 *
 *  ```js
 *  var config = require('config-attendant')('foo', { defaultOpts: 'value' });
 *  ```
 *
 *  Returns {Object} combined config properties.
 */
export default function config(name, defaults = {}, argv = minimist, parse = cc.parse) {
  if (typeof name !== 'string') throw new Error('rc(name): name *must* be string');
  let _defaults = (typeof defaults === 'string') ? cc.json(defaults) : defaults;
  if (!_defaults) _defaults = {};
  const env = cc.env(`${name}_`);

  const configs = [_defaults];
  const configFiles = [];

  // which files do we look at?
  if (!win) {
    [join(etc, name, 'config'), join(etc, `${name}rc`)].forEach((configFile) => {
      _addConfigFile(configFile, configs, configFiles, parse);
    });
  }
  if (home) {
    [join(home, '.config', name, 'config'),
    join(home, '.config', name),
    join(home, `.${name}`, 'config'),
    join(home, `.${name}rc`)].forEach((configFile) => {
      _addConfigFile(configFile, configs, configFiles, parse);
    });
  }
  const packageFile = _addPackageJSON([name], configs);
  _addConfigFile(cc.find(`.${name}rc`), configs, configFiles, parse);
  if (env.config) _addConfigFile(env.config, configs, configFiles, parse);
  if (argv.config) _addConfigFile(argv.config, configs, configFiles, parse);
  return deepExtend(...configs.concat([
    env,
    argv,
    configFiles.length ? { configs: configFiles,
      config: configFiles[configFiles.length - 1] } : undefined,
    packageFile ? { packageFile } : undefined,
  ]));
}
