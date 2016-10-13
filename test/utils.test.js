import test from 'ava';
import cc from '../src/lib/utils';

test('file expects string', t => {
  t.throws(() => {
    cc.file({ option: false });
  }, /Path must be a string\./);
});
