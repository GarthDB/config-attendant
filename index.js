#! /usr/bin/env node
var cc   = require('./lib/utils')
var join = require('path').join
var deepExtend = require('deep-extend')
var etc = '/etc'
var win = process.platform === "win32"
var home = win
           ? process.env.USERPROFILE
           : process.env.HOME

module.exports = function (name, defaults, argv, parse) {
  if('string' !== typeof name)
    throw new Error('rc(name): name *must* be string')
  if(!argv)
    argv = require('minimist')(process.argv.slice(2))
  defaults = (
      'string' === typeof defaults
    ? cc.json(defaults) : defaults
    ) || {}

  parse = parse || cc.parse

  var env = cc.env(name + '_')

  var configs = [defaults]
  var configFiles = []
  function addConfigFile (file) {
    if (configFiles.indexOf(file) >= 0) return
    var fileConfig = cc.file(file)
    if (fileConfig) {
      configs.push(parse(fileConfig))
      configFiles.push(file)
    }
  }
  var packageFile = '';
  function addPackageJSON (places) {
    packageFile = cc.find('package.json')
    if (packageFile) {
      var packageJSON = require(packageFile)
      places.forEach(function(place){
        if ({}.hasOwnProperty.call(packageJSON, place)) {
          configs.push(packageJSON[place]);
        }
        if ({}.hasOwnProperty.call(packageJSON, 'config') &&
          {}.hasOwnProperty.call(packageJSON.config, place)) {
          configs.push(packageJSON.config[place]);
        }
      })
    }
  }

  // which files do we look at?
  if (!win)
   [join(etc, name, 'config'),
    join(etc, name + 'rc')].forEach(addConfigFile)
  if (home)
   [join(home, '.config', name, 'config'),
    join(home, '.config', name),
    join(home, '.' + name, 'config'),
    join(home, '.' + name + 'rc')].forEach(addConfigFile)
  addConfigFile(cc.find('.'+name+'rc'))
  if (env.config) addConfigFile(env.config)
  if (argv.config) addConfigFile(argv.config)
  addPackageJSON([name,])
  return deepExtend.apply(null, configs.concat([
    env,
    argv,
    configFiles.length ? {configs: configFiles, config: configFiles[configFiles.length - 1]} : undefined,
    { packageFile: packageFile }
  ]))
}

if(!module.parent) {
  console.log(
    JSON.stringify(module.exports(process.argv[2]), false, 2)
  )
}
