import puppeteer from 'puppeteer';
import fs from "fs";
import child_process from "child_process";

export const delay = ms => new Promise(res => setTimeout(res, ms));

export const make_paged_png = async (url, prefix, debug = false) => {
  let browser;
  try {
    browser = await puppeteer.launch({headless: !debug, devtools: debug});

    const page = await browser.newPage();
    let pageHeight = 1122;
    await page.setViewport({width: 800, height: pageHeight})

    await page.goto(url, {waitUntil: 'networkidle2'});

    const bodyHeight = await page.evaluate((_) => {
      return document.body.scrollHeight
    })

    await page.setViewport({width: 800, height: bodyHeight})

    await page.screenshot({
      path: `${prefix}-full.png`,
      fullPage: true,
    });

    for (let nr = 0; nr * pageHeight < bodyHeight; nr++) {
      const pg = await page.evaluate((nr) => {
        let el = document.getElementById(`page-${nr}`);
        if (el === null) {
          return {top: 0, height: document.body.scrollHeight}
        } else {
          return {top: el.getBoundingClientRect().top, height: el.scrollHeight}
        }
      }, nr + 1)
      await page.screenshot({
        path: `${prefix}-${nr + 1}.png`,
        clip: {
          x: 0,
          y: pg.top,
          width: 800,
          height: pg.height,
        }
      });
    }

  } catch (err) {
    console.log(err.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

export const compare_images = (before, latest, diff) => {
  try {
    child_process.execSync(`compare -metric AE ${before} ${latest} ${diff}`).toString();
    if (fs.existsSync(diff)) {
      fs.unlinkSync(diff)
    }
    fs.unlinkSync(latest)
    return true
  } catch (error) {
    return false
  }
}
