var test = require('ava');
var nixt = require('nixt');
var path = require('path');

test.cb('should use package.json data', function(t) {
  var dir = path.resolve(__dirname, 'project');
  var expected = {
    "option": false,
    "newOption": "yip",
    "envOption": 22,
    "_": [
      "configrc"
    ],
    "packageFile": path.resolve(dir, 'package.json')
  }
  nixt()
  .expect(function(result) {
    var resultObj = JSON.parse(result.stdout);
    t.deepEqual(resultObj,expected);
  })
  .cwd(dir)
  .run('config configrc')
  .end(t.end);
});

test.cb('should use config in package.json data', function(t) {
  var dir = path.resolve(__dirname, 'project-config');
  var expected = {
    "option": false,
    "envOption": 22,
    "_": [
      "foo"
    ],
    "packageFile": path.resolve(dir, 'package.json')
  }
  nixt()
  .expect(function(result) {
    var resultObj = JSON.parse(result.stdout);
    t.deepEqual(resultObj,expected);
  })
  .cwd(dir)
  .run('config foo')
  .end(t.end);
});

test.cb('should throw an error when name is not specified', function(t) {
  nixt()
  .expect(function(result) {
    var errorIndex = result.stderr.indexOf('Error: rc(name): name *must* be string');
    t.true(Boolean(errorIndex > -1));
  })
  .run('config')
  .end(t.end);
});

test.cb('Should not return packageFile if none is found', function(t) {
  var dir = path.resolve(__dirname, '../../');
  var expected = {
    "_": [
      "foo"
    ]
  }
  nixt()
  .expect(function(result) {
    t.deepEqual(JSON.parse(result.stdout), expected);
  })
  .cwd(dir)
  .run('config foo')
  .end(t.end);
});

test.cb('should accept command line arguments', function(t) {
  var dir = path.resolve(__dirname, 'project-config');
  var configPath = '../defaults.json';
  var expected = {
    "option": false,
    "envOption": 24,
    "_": [
      "foo"
    ],
    "config": configPath,
    "configs": [
      configPath
    ],
    "packageFile": path.resolve(dir, 'package.json')
  }
  nixt()
  .expect(function(result) {
    var resultObj = JSON.parse(result.stdout);
    t.deepEqual(resultObj,expected);
  })
  .cwd(dir)
  .run('config foo --config ' + configPath)
  .end(t.end);
});
