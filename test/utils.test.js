var test = require('ava');
var nixt = require('nixt');
var path = require('path');

var cc = require('../lib/utils');

test('file expects string', function(t) {
  var file = cc.file({option: false});
  t.is(file, undefined);
});
