#! /usr/bin/env node
import config from '../lib';

// eslint-disable-next-line no-console
console.log(
  JSON.stringify(config(process.argv[2]), false, 2)
);
