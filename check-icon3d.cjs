const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 2 });
  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => consoleErrors.push('PAGEERROR: ' + String(err)));

  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  const ids = ['icon3d-suitcase', 'icon3d-quote', 'icon3d-code', 'icon3d-graduationcap', 'icon3d-book', 'icon3d-aboutme', 'icon3d-contact'];
  for (const id of ids) {
    const el = await page.$(`#${id}`);
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    await page.evaluate((elId) => {
      const e = document.getElementById(elId);
      e.style.transform = 'scale(6)';
      e.style.transformOrigin = 'center';
      e.style.position = 'relative';
      e.style.zIndex = '9999';
      e.style.background = '#0a0a0a';
    }, id);
    await page.waitForTimeout(150);
    const box = await page.evaluate((elId) => document.getElementById(elId).getBoundingClientRect(), id);
    await page.screenshot({
      path: `C:\\Users\\Paul\\AppData\\Local\\Temp\\claude\\c--Users-Paul-Desktop-pruebaAstro\\aff54aad-c2ea-4810-8844-6155aeb03d7f\\scratchpad\\all-${id}.png`,
      clip: { x: Math.max(0, box.x - 5), y: Math.max(0, box.y - 5), width: box.width + 10, height: box.height + 10 },
    });
    await page.evaluate((elId) => {
      const e = document.getElementById(elId);
      e.style.transform = '';
      e.style.position = '';
      e.style.zIndex = '';
    }, id);
  }

  console.log('console errors:', JSON.stringify(consoleErrors, null, 2));
  await browser.close();
})();
