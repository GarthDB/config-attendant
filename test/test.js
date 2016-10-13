import fs from 'fs';
import path from 'path';
import test from 'ava';
import configAttendant from '../src/lib/index';

let n;

function removeProps(obj, props) {
  for (let i = 0; i < props.length; i++) {
    delete obj[props[i]];
  }
  return obj;
}

test.before(() => {
  n = `rc${Math.random()}`;
});

test('Throws error if appname not a string', t => {
  t.throws(() => {
    configAttendant({ option: true });
  }, /rc\(name\): name \*must\* be string/);
});

test('should use package.json data', t => {
  const dir = path.resolve(__dirname, 'project');
  const expected = {
    option: true,
    package: 21,
  };
  const initDir = process.cwd();
  process.chdir(dir);
  const config = configAttendant('foo', {
    option: true,
  });
  removeProps(config, ['_', 'packageFile']);
  t.deepEqual(config, expected);
  process.chdir(initDir);
});

test('should use config in package.json data', t => {
  const dir = path.resolve(__dirname, 'project-config');
  const expected = {
    option: false,
    envOption: 22,
  };
  const initDir = process.cwd();
  process.chdir(dir);
  const config = configAttendant('foo', {
    option: true,
  });
  removeProps(config, ['_', 'packageFile']);
  t.deepEqual(config, expected);
  process.chdir(initDir);
});

test('Env variable overrides default', t => {
  process.env[`${n}_envOption`] = 42;
  const config = configAttendant(n, {
    option: true,
  });
  removeProps(config, ['_', 'packageFile']);
  const expected = { option: true, envOption: '42' };
  t.deepEqual(config, expected);
  delete process.env[`${n}_envOption`];
});

test('Custom Argv', t => {
  const config = configAttendant(n, {
    option: true,
  }, {
    option: false,
    envOption: 24,
    argv: {
      remain: [],
      cooked: ['--no-option', '--envOption', '24'],
      original: ['--no-option', '--envOption=24'],
    },
  });
  removeProps(config, ['argv', 'packageFile']);
  const expected = { option: false, envOption: 24 };
  t.deepEqual(config, expected);
});

test('Json rc', t => {
  const jsonrc = path.resolve(`.${n}rc`);
  fs.writeFileSync(jsonrc, [
    '{',
    '// json overrides default',
    '"option": false,',
    '/* env overrides json */',
    '"envOption": 24',
    '}',
  ].join('\n'));
  const config = configAttendant(n, {
    option: true,
  });
  fs.unlinkSync(jsonrc);
  removeProps(config, ['_', 'packageFile']);
  const expected = { option: false, envOption: 24, config: jsonrc, configs: [jsonrc] };
  t.deepEqual(config, expected);
});

test('JSON string defaults', t => {
  const config = configAttendant(n, path.resolve('defaults.json'));
  removeProps(config, ['_', 'packageFile']);
  const expected = { option: false, envOption: 24 };
  t.deepEqual(config, expected);
});

test('JSON string defaults, missing file', t => {
  const config = configAttendant(n, path.resolve('missing.json'));
  removeProps(config, ['_', 'packageFile']);
  t.deepEqual(config, {});
});

test('Use env variable to set config default values', t => {
  process.env[`${n}_config`] = './defaults.json';
  const config = configAttendant(n, {
    option: true,
  });
  const expected = {
    option: false,
    envOption: 24,
    config: './defaults.json',
    configs: ['./defaults.json'],
  };
  removeProps(config, ['_', 'packageFile']);
  t.deepEqual(config, expected);
  delete process.env[`${n}_config`];
});

test('Nested env variables', t => {
  // Basic usage
  process.env[`${n}_someOpt__a`] = 42;
  process.env[`${n}_someOpt__x__`] = 99;
  process.env[`${n}_someOpt__a__b`] = 186;
  process.env[`${n}_someOpt__a__b__c`] = 243;
  process.env[`${n}_someOpt__x__y`] = 1862;
  process.env[`${n}_someOpt__z`] = 186577;

  // Should ignore empty strings from orphaned '__'
  process.env[`${n}_someOpt__z__x__`] = 18629;
  process.env[`${n}_someOpt__w__w__`] = 18629;

  // Leading '__' should ignore everything up to 'z'
  process.env[`${n}___z__i__`] = 9999;

  const config = configAttendant(n, {
    option: true,
  });

  const expected = {
    option: true,
    someOpt: {
      a: '42',
      x: '99',
      z: '186577',
      w: {
        w: '18629',
      },
    },
    z: { i: '9999' },
  };
  removeProps(config, ['_', 'packageFile']);
  t.deepEqual(config, expected);
  delete process.env[`${n}_someOpt__a`];
  delete process.env[`${n}_someOpt__x__`];
  delete process.env[`${n}_someOpt__a__b`];
  delete process.env[`${n}_someOpt__a__b__c`];
  delete process.env[`${n}_someOpt__x__y`];
  delete process.env[`${n}_someOpt__z`];
  delete process.env[`${n}_someOpt__z__x__`];
  delete process.env[`${n}_someOpt__w__w__`];
  delete process.env[`${n}___z__i__`];
});

test('should handle config file added more than once', t => {
  const dir = path.resolve(__dirname, 'duplicate-config');
  const configPath = path.resolve(__dirname, 'duplicate-config', '.thingrc');
  const expected = {
    option: false,
    envOption: 24,
    config: configPath,
    configs: [configPath],
    packageFile: path.resolve(__dirname, '..', 'package.json'),
  };
  process.env.thing_config = configPath;
  const initDir = process.cwd();
  process.chdir(dir);
  const config = configAttendant('thing');
  removeProps(config, ['_']);
  t.deepEqual(config, expected);
  process.chdir(initDir);
  delete process.env.thing_config;
});
