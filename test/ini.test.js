var test = require('ava');
var nixt = require('nixt');
var path = require('path');

var cc = require('../lib/utils');
var INI = require('ini');

test('INI parser', function(t) {
  var _json, _ini;
  var fixture = {hello: true};
  var json = cc.parse (_json = JSON.stringify(fixture))
  var ini = cc.parse (_ini = INI.stringify(fixture))
  t.deepEqual(json, ini)
});
