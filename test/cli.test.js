import test from 'ava';
import nixt from 'nixt';
import path from 'path';

test.cb('should use package.json data', t => {
  const dir = path.resolve(__dirname, 'project');
  const expected = {
    package: 21,
    _: [
      'foo',
    ],
    packageFile: path.resolve(dir, 'package.json'),
  };
  nixt()
  .expect(result => {
    const resultObj = JSON.parse(result.stdout);
    t.deepEqual(resultObj, expected);
  })
  .cwd(dir)
  .run('config foo')
  .end(t.end);
});

test.cb('should use config in package.json data', t => {
  const dir = path.resolve(__dirname, 'project-config');
  const expected = {
    option: false,
    envOption: 22,
    _: [
      'foo',
    ],
    packageFile: path.resolve(dir, 'package.json'),
  };
  nixt()
  .expect(result => {
    const resultObj = JSON.parse(result.stdout);
    t.deepEqual(resultObj, expected);
  })
  .cwd(dir)
  .run('config foo')
  .end(t.end);
});

test.cb('should throw an error when name is not specified', t => {
  nixt()
  .expect(result => {
    const errorIndex = result.stderr.indexOf('Error: rc(name): name *must* be string');
    t.true(Boolean(errorIndex > -1));
  })
  .run('config')
  .end(t.end);
});

test.cb('Should not return packageFile if none is found', t => {
  const dir = path.resolve(__dirname, '../../');
  const expected = {
    _: [
      'foo',
    ],
  };
  nixt()
  .expect(result => {
    t.deepEqual(JSON.parse(result.stdout), expected);
  })
  .cwd(dir)
  .run('config foo')
  .end(t.end);
});

test.cb('should accept command line arguments', t => {
  const dir = path.resolve(__dirname, 'project-config');
  const configPath = '../defaults.json';
  const expected = {
    option: false,
    envOption: 24,
    _: [
      'foo',
    ],
    config: configPath,
    configs: [
      configPath,
    ],
    packageFile: path.resolve(dir, 'package.json'),
  };
  nixt()
  .expect(result => {
    const resultObj = JSON.parse(result.stdout);
    t.deepEqual(resultObj, expected);
  })
  .cwd(dir)
  .run(`config foo --config ${configPath}`)
  .end(t.end);
});
