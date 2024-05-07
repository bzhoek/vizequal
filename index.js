const puppeteer = require('puppeteer');
const fs = require('fs');
const child_process = require('child_process');

const delay = ms => new Promise(res => setTimeout(res, ms));

const make_paged_png = async (url, prefix, debug = false) => {
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

const make_full_png = async (url, filepath, debug = false) => {
  let browser;
  try {
    browser = await puppeteer.launch({headless: !debug, devtools: debug});

    const page = await browser.newPage();
    await page.goto(url, {waitUntil: 'networkidle0'});

    const bodyHeight = await page.evaluate((_) => {
      return document.body.scrollHeight
    })

    await page.setViewport({width: 1280, height: bodyHeight})

    await page.screenshot({
      path: filepath,
      fullPage: true,
    });
  } catch (err) {
    console.log(err.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

const compare_images = (before, latest, diff) => {
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

async function scroll(page) {
  return await page.evaluate(async () => {
    return await new Promise((resolve, reject) => {
      var i = setInterval(() => {
        window.scrollBy(0, window.innerHeight);
        if (
          document.scrollingElement.scrollTop + window.innerHeight >=
          document.scrollingElement.scrollHeight
        ) {
          window.scrollTo(0, 0);
          clearInterval(i);
          resolve();
        }
      }, 100);
    });
  });
}

module.exports = {make_paged_png, make_full_png, compare_images}