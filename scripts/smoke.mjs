/**
 * smoke.mjs — 无头浏览器冒烟测试（playwright-core + 系统 Edge）
 * 覆盖：开机、桌面、Finder、设置 + 浅色主题、游戏启动。
 * 输出：shots/*.png 与控制台错误清单。
 */
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://localhost:5173';

mkdirSync('shots', { recursive: true });

const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console.error: ${m.text()}`);
});
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

async function shot(name) {
  await page.screenshot({ path: `shots/${name}.png` });
  console.log(`shot: ${name}`);
}

console.log('→ goto');
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(1200);

// 跳过开机动画（若仍在播放）
try {
  const splash = page.getByRole('button', { name: '点击跳过开机动画' });
  if (await splash.count()) await splash.click({ timeout: 2000 });
} catch {}
await page.waitForTimeout(900);
await shot('01-desktop');

// 打开 Finder（Dock）
const finder = page.getByRole('button', { name: 'Finder', exact: true }).first();
if (await finder.count()) await finder.click();
await page.waitForTimeout(900);
await shot('02-finder');

// 打开设置并切浅色
const settings = page.getByRole('button', { name: '设置', exact: true }).first();
if (await settings.count()) await settings.click();
await page.waitForTimeout(900);
const lightBtn = page.getByRole('button', { name: '浅色', exact: true }).first();
if (await lightBtn.count()) await lightBtn.click();
await page.waitForTimeout(700);
await shot('03-settings-light');

// 打开游戏并开始
const game = page.getByRole('button', { name: '太空射击', exact: true }).first();
if (await game.count()) await game.click();
await page.waitForTimeout(1400);
const start = page.getByRole('button', { name: '开始游戏', exact: true }).first();
if (await start.count()) {
  await start.click();
  console.log('→ game started');
} else {
  console.log('! 开始游戏 button not found');
}
await page.waitForTimeout(1800);
await shot('04-game-playing');

// 暂停再恢复（验证暂停菜单）
await page.keyboard.press('p');
await page.waitForTimeout(500);
await shot('05-game-paused');
await page.keyboard.press('p');
await page.waitForTimeout(400);

// 检查 WebGL canvas
const canvases = await page.locator('canvas').count();
const bodyText = (await page.locator('body').innerText()).slice(0, 120).replace(/\n/g, ' | ');
console.log(`CANVAS_COUNT=${canvases}`);
console.log(`BODY: ${bodyText}`);
console.log(`ERRORS(${errors.length}):`);
for (const e of errors) console.log('  ' + e);

await browser.close();
console.log('DONE');
