import puppeteer from 'puppeteer';

export const delay = ms => new Promise(res => setTimeout(res, ms));

export const make_png = async (url, prefix, debug = false) => {
  let browser;
  try {
    browser = await puppeteer.launch({headless: !debug, devtools: debug});

    const page = await browser.newPage();
    await page.setViewport({width: 800, height: 1122})

    await page.goto(url, {waitUntil: 'networkidle2'});
    await page.waitForSelector(".pagedjs_pages", {timeout: 5000});

    for (let nr = 1; nr < 11; nr++) {
      let result = await page.evaluate((nr) => {
        for (let i = 1; i < 100; i++) {
          let page = document.getElementById(`page-${i}`)
          if (page !== null) {
            page.style.display = i === nr ? 'block' : 'none'
            window.scrollTo(0, page.scrollHeight)
          } else {
            return nr >= i ? null : nr
          }
        }
      }, nr)
      console.log(nr, result)

      await delay(500)
      if (result !== null) {
        let output = `${prefix}-${nr}.png`
        await page.screenshot({
          path: output,
          fullPage: true,
        });
        console.log(`Wrote to ${output}`)
      }
    }

  } catch (err) {
    console.log(err.message);
  } finally {
    if (browser) {
      browser.close();
    }
  }
};

export const compare_images = (before, latest, diff) => {
  try {
    child_process.execSync(`compare -metric AE ${before} ${latest} ${diff}`).toString();
    if (fs.existsSync(diffFile)) {
      fs.unlinkSync(diffFile)
    }
    fs.unlinkSync(latestFile)
    return true
  } catch (error) {
    return false
  }
}
