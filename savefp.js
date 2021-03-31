import {make_png} from './index.js';
import path from 'path';

let args = process.argv.slice(2);
if (args.length !== 2) {
  console.log('USAGE: <url> <output>.png')
  process.exit(1)
}

let url = args[0]
let output = args[1]

make_png(url, output)