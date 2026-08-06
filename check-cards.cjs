const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1200 } });
  await page.goto('http://localhost:4321/projects/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  const box = await page.evaluate(() => {
    const el = document.querySelector('.project-card');
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });

  for (let i = 0; i < 5; i++) {
    await page.screenshot({
      path: `C:\\Users\\Paul\\AppData\\Local\\Temp\\claude\\c--Users-Paul-Desktop-pruebaAstro\\aff54aad-c2ea-4810-8844-6155aeb03d7f\\scratchpad\\card-t${i}.png`,
      clip: box,
    });
    await page.waitForTimeout(500);
  }

  await browser.close();
})();
