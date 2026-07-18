import { chromium } from 'playwright';

const dir = 'C:/Users/avaAu/AppData/Local/Temp/claude/c--Users-avaAu-Portfolio/4b8cfdc0-3640-428b-824a-c7a0fcca1e0f/scratchpad';
const url = 'http://localhost:4321/';

const browser = await chromium.launch();
const warm = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await warm.goto(url, { waitUntil: 'networkidle' });
await warm.close();

const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(url, { waitUntil: 'networkidle' });

// t~500ms: Freelance pill should already be visible (alone), badge hidden, image should look bigger (desktop lg size)
await page.waitForTimeout(500);
await page.screenshot({ path: `${dir}/final1_early.png`, clip: { x: 0, y: 100, width: 700, height: 350 } });

// wait through face(~7s) + name(~7.3s) animations to badge reveal moment; capture a burst of frames right around reveal
await page.waitForTimeout(13500); // ~14s total, should be right at/just after reveal
await page.screenshot({ path: `${dir}/final2_reveal.png`, clip: { x: 0, y: 100, width: 700, height: 350 } });

await page.waitForTimeout(150);
await page.screenshot({ path: `${dir}/final3_reveal_mid.png`, clip: { x: 0, y: 100, width: 700, height: 350 } });

await page.waitForTimeout(600);
await page.screenshot({ path: `${dir}/final4_settled.png`, clip: { x: 0, y: 100, width: 700, height: 350 } });

await browser.close();
