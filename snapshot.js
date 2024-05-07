#!/usr/bin/env node
const {Command} = require('commander');
const {make_full_png, compare_images, compare_url} = require("./index");
const fs = require('fs/promises');

let cli = new Command()
cli.command('file')
  .argument('<file>', 'File with urls to take snapshot of')
  .description('Make a new snapshot and compare it to the previous if present')
  .action(async (file) => {
    let urls = await fs.readFile(file, 'utf8')
    for (const url of urls.split('\n')) {
      let url_ = new URL(url)
      let pathname = url_.pathname.replace(/\//g, '_')
      await compare_url(url, pathname)
    }
  })

cli.command('full')
  .argument('<url>', 'Page to take snapshot of')
  .description('Make a new snapshot and compare it to the previous if present')
  .action(async (url) => {
    let url_ = new URL(url)
    let pathname = url_.pathname.replace(/\//g, '_')
    await compare_url(url, pathname)
  })

cli.parse()
