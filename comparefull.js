import {compare_images, make_full_png} from './index.js';
import fs from 'fs/promises';

let args = process.argv.slice(2);
if (args.length !== 2) {
  console.log('USAGE: <url> <prefix>.png')
  process.exit(1)
}

const run = async (url, prefix) => {
  await make_full_png(url, `${prefix}-latest`).then(() => console.log("Done."))
  let latest = `${prefix}-latest.png`;
  let original = `${prefix}.png`;
  fs.stat(original).then((stat) => {
    if (stat.isFile()) {
      compare_images(original, latest, `${prefix}-diff.png`)
    }
  }).catch(() => {
    fs.rename(latest, original)
      .then(() => {console.log(original, "does not exist. Creating from latest.")})
      .catch((err) => {console.error(err)})
  })
}

run(args[0], args[1])

