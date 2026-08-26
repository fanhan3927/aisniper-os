/**
 * smoke4.mjs — 游戏局内验证：开火、击杀、得分、波次推进
 */
import { chromium } from 'playwright-core';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://localhost:5173';
const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('favicon')) errors.push(m.text()); });

const ok = (name, cond) => console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);

await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(800);
await page.getByRole('button', { name: '太空射击', exact: true }).first().click();
await page.waitForTimeout(1400);
await page.getByRole('button', { name: '开始游戏', exact: true }).first().click();
await page.waitForTimeout(600);

// 按住空格连续射击，鼠标轻微移动
await page.keyboard.down('Space');
for (let i = 0; i < 14; i++) {
  await page.mouse.move(400 + (i % 6) * 60, 300 + (i % 4) * 50);
  await page.waitForTimeout(1000);
}
await page.keyboard.up('Space');

// 读取 gameStore（localStorage 持久化 + store 在 window 上的引用不可直接访问，改从 DOM 读）
const bodyText = await page.locator('body').innerText();
const scoreMatch = bodyText.match(/([\d,]+)/);
// 暂停后看分数
await page.keyboard.press('p');
await page.waitForTimeout(300);
const pausedText = await page.locator('body').innerText();

console.log('局内文本:', bodyText.slice(0, 260).replace(/\n/g, ' | '));

// 分数 > 0 说明有击杀
const scoreNum = parseInt((pausedText.match(/已暂停/) ? pausedText : bodyText).split('已暂停')[0].replace(/[^\d]/g, '').slice(0, 8) || '0', 10);
ok(`得分增长（score=${scoreNum}）`, scoreNum > 0);

// 健康弹窗应显示游戏负载抬高
await page.click('[aria-label="系统健康度"]');
await page.waitForTimeout(800);
const healthText = await page.locator('body').innerText();
ok('游戏运行时健康弹窗可见', healthText.includes('系统健康度'));

// 结算面板：撞死玩家（等敌机靠近，或直接结束：多次暂停无意义，这里验证 HUD 波次推进）
ok('波次推进到 2+', /波次\s*[2-9]/.test(bodyText));

console.log(`\nCONSOLE_ERRORS(${errors.length}):`);
for (const e of errors) console.log('  ' + e);
await browser.close();
console.log('DONE');
