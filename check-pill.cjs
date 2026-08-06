const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 500, height: 700 }, deviceScaleFactor: 3 });
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.getElementById('available-badge')?.classList.add('is-shown');
  });
  await page.waitForTimeout(150);
  const box = await page.evaluate(() => {
    const el = document.querySelector('.freelance-tag');
    const r = el.getBoundingClientRect();
    return { top: r.top, left: r.left, right: r.right, bottom: r.bottom };
  });
  console.log(JSON.stringify(box));
  await page.screenshot({ path: `C:\\Users\\Paul\\AppData\\Local\\Temp\\claude\\c--Users-Paul-Desktop-pruebaAstro\\aff54aad-c2ea-4810-8844-6155aeb03d7f\\scratchpad\\full.png` });
  await browser.close();
})();
