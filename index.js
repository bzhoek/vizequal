export const make_png = async (url, output, debug = false) => {
  let browser;
  try {
    browser = await puppeteer.launch({headless: !debug, devtools: debug});

    const page = await browser.newPage();
    await page.goto(url);

    await page.waitForSelector(".pagedjs_pages", {timeout: 5000});
    await delay(1000);

    if (debug) {
      await page._client.send("Emulation.clearDeviceMetricsOverride");
      await page.waitForSelector(".never", {timeout: 0});
    }

    await page.screenshot({
      path: output,
      fullPage: true
    });
    console.log(`Wrote to ${output}`)
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
