import {test} from 'ava';
import hello from './index';
import world from './world';

test(t => {
  t.is(typeof hello, 'function');
  t.is(typeof world, 'string');
  t.is(hello(), `Hello ${world}!`);
  t.is(hello('you'), 'Hello you!');
});
