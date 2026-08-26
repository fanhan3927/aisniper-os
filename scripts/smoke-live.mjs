/**
 * smoke-live.mjs — 线上 GitHub Pages 冒烟验证
 */
import { chromium } from 'playwright-core';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const LIVE = 'https://fanhan3927.github.io/aisniper-os/';
const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

const ok = (name, cond) => console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);

await page.goto(LIVE, { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(1200);

// 开机动画出现
const splash = await page.locator('[aria-label="点击跳过开机动画"]').count();
ok('开机动画渲染', splash > 0);
await page.click('[aria-label="点击跳过开机动画"]').catch(() => {});
await page.waitForTimeout(900);

// 菜单栏时钟
const clockText = await page.locator('header button[aria-label="时钟与日历"]').innerText();
ok(`菜单栏时钟渲染（${clockText.trim()}）`, clockText.trim().length > 6);

// 打开 Finder + 游戏（走线上静态资源）
await page.getByRole('button', { name: 'Finder', exact: true }).first().click();
await page.waitForTimeout(800);
let body = await page.locator('body').innerText();
ok('Finder 打开', body.includes('README.md'));

await page.getByRole('button', { name: '太空射击', exact: true }).first().click();
await page.waitForTimeout(1500);
await page.getByRole('button', { name: '开始游戏', exact: true }).first().click();
await page.waitForTimeout(1500);
body = await page.locator('body').innerText();
ok('游戏启动 + HUD', body.includes('波次'));

console.log(`CONSOLE_ERRORS(${errors.length}):`);
for (const e of errors) console.log('  ' + e);
await browser.close();
console.log('DONE');
