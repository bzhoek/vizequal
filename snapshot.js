#!/usr/bin/env node
const {Command} = require('commander');
const {make_full_png, compare_images} = require("./index");
const fs = require('fs/promises');

let cli = new Command()
cli.command('full')
  .argument('<url>', 'Page to take snapshot of')
  .argument('<filename>', 'Name for local snapshot image')
  .description('Make a new snapshot and compare it to the previous if present')
  .action(async (url, filename) => {
    let latest = `snapshots/${filename}-latest.png`;
    console.log(`Writing ${url} to ${latest}`)
    await make_full_png(url, latest).then(() => console.log("Done."));
    let original = `snapshots/${filename}.png`;
    console.log(`Comparing ${original} to ${latest}`)
    fs.stat(original).then((stat) => {
      if (stat.isFile()) {
        compare_images(original, latest, `snapshots/${filename}-diff.png`)
      }
    }).catch(() => {
      fs.rename(latest, original)
        .then(() => {
          console.log(original, "does not exist. Creating from latest.")
        })
        .catch((err) => {
          console.error(err)
        })
    })
  })

cli.parse()
