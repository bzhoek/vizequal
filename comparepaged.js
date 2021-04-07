import {compare_images, make_paged_png} from './index.js';
import path from 'path';
import fs from 'fs/promises';

let args = process.argv.slice(2);
if (args.length !== 2) {
  console.log('USAGE: <url> <prefix>.png')
  process.exit(1)
}

const run = async (url, prefix) => {
  await make_paged_png(url, `${prefix}-latest`).then(() => console.log("Done."))
  let folder = path.dirname(prefix)
  fs.readdir(folder).then((files) => {
    files.forEach((file) => {
      let match = file.match(/^(.+?)-latest(.+?)$/)
      if (match) {
        let latest = path.join(folder, file)
        let original = path.join(folder, match[1] + match[2]);
        fs.stat(original).then((stat) => {
          if (stat.isFile()) {
            compare_images(original, latest, match[1] + '-diff' + match[2])
          }
        }).catch(() => {
          fs.rename(path.join(folder, file), original)
            .then(() => {console.log(original, "does not exist. Creating from latest.")})
            .catch((err) => {console.error(err)})
        })
      }
    })
  })
}

run(args[0], args[1])

