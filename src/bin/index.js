#! /usr/bin/env node
import config from '../lib';

console.log(
  JSON.stringify(config(process.argv[2]), false, 2)
);
