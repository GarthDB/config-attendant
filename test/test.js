var test = require('ava');
var configAttendant = require('../');
var fs = require('fs');
var path = require('path');

var n;

function removeProps(obj, props){
  for (var i = 0; i < props.length; i++) {
    delete obj[props[i]];
  }
  return obj;
}

test.before(function(t) {
  n = 'rc'+Math.random();
});

test('Env variable overrides default', function(t) {
  process.env[n+'_envOption'] = 42
  var config = configAttendant(n, {
    option: true
  });
  removeProps(config, ['_', 'packageFile']);
  var expected = {option: true, envOption: '42'}
  t.deepEqual(config, expected);
});

test('Custom Argv', function(t) {
  var config = configAttendant(n, {
    option: true
  }, {
    option: false,
    envOption: 24,
    argv: {
      remain: [],
      cooked: ['--no-option', '--envOption', '24'],
      original: ['--no-option', '--envOption=24']
    }
  });
  removeProps(config, ['argv', 'packageFile']);
  var expected = {option: false, envOption: 24};
  t.deepEqual(config, expected);
});

test('Json rc', function(t) {
  var jsonrc = path.resolve('.' + n + 'rc');
  fs.writeFileSync(jsonrc, [
    '{',
      '// json overrides default',
      '"option": false,',
      '/* env overrides json */',
      '"envOption": 24',
    '}'
  ].join('\n'));
  var config = configAttendant(n, {
    option: true
  });
  fs.unlinkSync(jsonrc);
  removeProps(config, ['_', 'packageFile']);
  var expected = {option: false, envOption: '42', config:jsonrc, configs:[jsonrc]};
  t.deepEqual(config, expected);
});

test('JSON string defaults', function(t) {
  var config = configAttendant(n, path.resolve('defaults.json'));
  removeProps(config, ['_', 'packageFile']);
  var expected = {option: false, envOption: '42'};
  t.deepEqual(config, expected);
});

test('JSON string defaults, missing file', function(t) {
  var config = configAttendant(n, path.resolve('missing.json'));
  removeProps(config, ['_', 'packageFile']);
  var expected = {envOption: "42"};
  t.deepEqual(config, expected);
});

test('Use env variable to set config default values', function(t) {
  process.env[n+'_config'] = './defaults.json';
  var config = configAttendant(n, {
    option: true
  });
  var expected = {
    option: false,
    envOption: '42',
    config: './defaults.json',
    configs: [ './defaults.json' ]
  };
  removeProps(config, ['_', 'packageFile']);
  t.deepEqual(config, expected);
  delete process.env[n+'_config'];
});

test('Nested env variables', function(t) {
  // Basic usage
  process.env[n+'_someOpt__a'] = 42
  process.env[n+'_someOpt__x__'] = 99
  process.env[n+'_someOpt__a__b'] = 186
  process.env[n+'_someOpt__a__b__c'] = 243
  process.env[n+'_someOpt__x__y'] = 1862
  process.env[n+'_someOpt__z'] = 186577

  // Should ignore empty strings from orphaned '__'
  process.env[n+'_someOpt__z__x__'] = 18629
  process.env[n+'_someOpt__w__w__'] = 18629

  // Leading '__' should ignore everything up to 'z'
  process.env[n+'___z__i__'] = 9999

  var config = configAttendant(n, {
    option: true
  })

  var expected = {
    option: true,
    envOption: '42',
    someOpt: {
      a: '42',
      x: '99',
      z: '186577',
      w: {
        w: '18629'
      }
    },
    z: { i: '9999' },
  };
  removeProps(config, ['_', 'packageFile']);
  t.deepEqual(config, expected);
  delete process.env[n+'_someOpt__a'];
  delete process.env[n+'_someOpt__x__'];
  delete process.env[n+'_someOpt__a__b'];
  delete process.env[n+'_someOpt__a__b__c'];
  delete process.env[n+'_someOpt__x__y'];
  delete process.env[n+'_someOpt__z'];
  delete process.env[n+'_someOpt__z__x__'];
  delete process.env[n+'_someOpt__w__w__'];
  delete process.env[n+'___z__i__'];
});
