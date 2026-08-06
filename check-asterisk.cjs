const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 400 }, deviceScaleFactor: 2 });
  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => consoleErrors.push('PAGEERROR: ' + String(err)));

  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.getElementById('comment-middle')?.classList.remove('grid-cols-[0fr]');
    document.getElementById('comment-middle')?.classList.add('grid-cols-[1fr]');
    document.getElementById('comment-middle-inner')?.classList.remove('opacity-0');
    document.getElementById('comment-middle-inner')?.classList.add('opacity-100');
  });
  await page.waitForTimeout(150);

  // Natural (unscaled) screenshot, this is what a real user actually sees.
  const box = await page.evaluate(() => document.querySelector('#menu-icon').getBoundingClientRect());
  await page.screenshot({
    path: `C:\\Users\\Paul\\AppData\\Local\\Temp\\claude\\c--Users-Paul-Desktop-pruebaAstro\\aff54aad-c2ea-4810-8844-6155aeb03d7f\\scratchpad\\asterisk-natural.png`,
    clip: { x: box.x - 4, y: box.y - 4, width: box.width + 8, height: box.height + 8 },
  });

  // Zoomed version for close inspection.
  await page.evaluate(() => {
    const el = document.querySelector('#menu-icon');
    el.style.transform = 'scale(8)';
    el.style.transformOrigin = 'top left';
    el.style.position = 'fixed';
    el.style.left = '20px';
    el.style.top = '20px';
    el.style.zIndex = '9999';
    el.style.background = 'black';
  });
  await page.waitForTimeout(150);
  await page.screenshot({
    path: `C:\\Users\\Paul\\AppData\\Local\\Temp\\claude\\c--Users-Paul-Desktop-pruebaAstro\\aff54aad-c2ea-4810-8844-6155aeb03d7f\\scratchpad\\asterisk-zoomed5.png`,
  });

  console.log('console errors:', JSON.stringify(consoleErrors));
  await browser.close();
})();
