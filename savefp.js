import {make_png} from './index.js';

let args = process.argv.slice(2);
if (args.length !== 2) {
  console.log('USAGE: <url> <prefix>.png')
  process.exit(1)
}

let url = args[0]
let prefix = args[1]

make_png(url, prefix).then(() => console.log("Done."))