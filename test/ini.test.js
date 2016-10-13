import test from 'ava';
import INI from 'ini';
import cc from '../src/lib/utils';

test('INI parser', t => {
  const fixture = { hello: true };
  const json = cc.parse(JSON.stringify(fixture));
  const ini = cc.parse(INI.stringify(fixture));
  t.deepEqual(json, ini);
});
