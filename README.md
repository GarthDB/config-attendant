# Config Attendant

[![Build Status](https://travis-ci.org/GarthDB/config-attendant.svg?branch=master)](https://travis-ci.org/GarthDB/config-attendant) [![codecov](https://codecov.io/gh/GarthDB/config-attendant/branch/master/graph/badge.svg)](https://codecov.io/gh/GarthDB/config-attendant) [![Dependency Status](https://david-dm.org/GarthDB/config-attendant.svg)](https://david-dm.org/GarthDB/config-attendant) [![npm version](https://badge.fury.io/js/config-attendant.svg)](https://badge.fury.io/js/config-attendant)

---

## Usage

### JS

The only option is to pass Config Attendant the name of your app, and your default configuration.

```js
var conf = require('config-attendant')(appname, {
  //defaults go here.
  port: 2468,

  //defaults which are objects will be merged, not replaced
  views: {
    engine: 'jade'
  }
});
```

Config Attendant will return your configuration options merged with the defaults you specify.
If you pass in a predefined defaults object, it will be mutated:

```js
var conf = {};
require('config-attendant')(appname, conf);
```

If Config Attendant finds any config files for your app, the returned config object will have
a `configs` array containing their paths:

```js
var appCfg = require('config-attendant')(appname, conf);
appCfg.configs[0] // /etc/appnamerc
appCfg.configs[1] // /home/dominictarr/.config/appname
appCfg.config // same as appCfg.configs[appCfg.configs.length - 1]
```

### CLI

#### Installation

To use Config Attendant as a command line tool (nice for testing out configurations), install it globally via npm.

```sh
npm install -g config-attendant
```

Parameters passed as strings are interpreted as app names, flags and values are interpreted as configuration values.

```sh
$ config appname --prop 'value'
{
  "_": [
    "appname"
  ],
  "prop": "value"
}
```

The only reserved flag is `--config` which can be used to point to json config files to load as well.

```sh
$ config appname --prop 'value' --config config-attendant/test/defaults.json
{
  "option": false,
  "envOption": 24,
  "_": [
    "appname"
  ],
  "prop": "value",
  "config": "config-attendant/test/defaults.json",
  "configs": [
    "config-attendant/test/defaults.json"
  ]
}
```

## Standards

Given your application name (`appname`), Config Attendant will look in all the obvious places for configuration.

  * command line arguments (parsed by minimist)
  * environment variables prefixed with `${appname}_`
    * or use "\_\_" to indicate nested properties
      _(e.g. `appname_foo__bar__baz` => `foo.bar.baz`)_
  * if you passed an option `--config file` then from that file
  * a local `.${appname}rc` or the first found looking in `./ ../ ../../ ../../../` etc.
  * a local `package.json` file or the first found looking in `./ ../ ../../ ../../../` etc.
    * within the `package.json` the `${appname}` value.
    * within the `package.json`, `config.${appname}`.
  * `$HOME/.${appname}rc`
  * `$HOME/.${appname}/config`
  * `$HOME/.config/${appname}`
  * `$HOME/.config/${appname}/config`
  * `/etc/${appname}rc`
  * `/etc/${appname}/config`
  * the defaults object you passed in.

All configuration sources that were found will be flattened into one object,
so that sources **earlier** in this list override later ones.

## Configuration File Formats

Configuration files (e.g. `.appnamerc`) may be in either [json](http://json.org/example) or [ini](http://en.wikipedia.org/wiki/INI_file) format. The example configurations below are equivalent:

### Formatted as `ini`

```ini
; You can include comments in `ini` format if you want.

dependsOn=0.10.0


; Config Attendant has built-in support for ini sections, see?

[commands]
  www     = ./commands/www
  console = ./commands/repl


; You can even do nested sections

[generators.options]
  engine  = ejs

[generators.modules]
  new     = generate-new
  engine  = generate-backend

```

### Formatted as `json`

```js
{
  // You can even comment your JSON, if you want
  "dependsOn": "0.10.0",
  "commands": {
    "www": "./commands/www",
    "console": "./commands/repl"
  },
  "generators": {
    "options": {
      "engine": "ejs"
    },
    "modules": {
      "new": "generate-new",
      "backend": "generate-backend"
    }
  }
}
```

Comments are stripped from JSON config via [strip-json-comments](https://github.com/sindresorhus/strip-json-comments).

> Since ini, and env variables do not have a standard for types, your application needs be prepared for strings.

## Advanced Usage

### Pass in your own `argv`

You may pass in your own `argv` object as the third argument to Config Attendant.  This is in case you want to [use your own command-line opts parser](https://github.com/dominictarr/rc/pull/12).

```js
require('config-attendant')(appname, defaults, customArgvObject);
```

## Pass in your own parser

If you have a special need to use a non-standard parser,
you can do so by passing in the parser as the 4th argument.
(leave the 3rd as null to get the default argv object (what `minimist` parses))

```js
require('config-attendant')(appname, defaults, null, parser);
```

This may also be used to force a more strict format,
such as strict, valid JSON only.

## Note on Performance

Config Attendant is running `fs.statSync`-- so make sure you don't use it in a hot code path (e.g. a request handler)

## License

Multi-licensed under the two-clause BSD License, MIT License, or Apache License, version 2.0
