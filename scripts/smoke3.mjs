/**
 * smoke3.mjs — 开机一次性 / 全屏 / 移动端 / Toast / 终端命令
 */
import { chromium } from 'playwright-core';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://localhost:5173';
const browser = await chromium.launch({ executablePath: EDGE, headless: true });

const ok = (name, cond) => console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);

// ---------- 桌面视口 ----------
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('favicon')) errors.push(m.text()); });

// 1. 首次访问：开机动画出现
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(600);
const splashVisible = await page.locator('[aria-label="点击跳过开机动画"]').count();
ok('首次访问显示开机动画', splashVisible > 0);
// 等动画播完
await page.waitForTimeout(1900);
const splashGone = (await page.locator('[aria-label="点击跳过开机动画"]').count()) === 0;
ok('开机动画自动结束', splashGone);

// 2. 刷新：不再自动播放（localStorage 已记录）
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(800);
const splashAgain = await page.locator('[aria-label="点击跳过开机动画"]').count();
ok('刷新后不再播放开机动画', splashAgain === 0);

// 3. 打开游戏 → 全屏 → 菜单栏隐藏
await page.getByRole('button', { name: '太空射击', exact: true }).first().click();
await page.waitForTimeout(1200);
await page.getByRole('button', { name: '开始游戏', exact: true }).first().click();
await page.waitForTimeout(600);
// HUD 全屏按钮（title=全屏）
const fsBtn = page.locator('button[title="全屏"]');
if (await fsBtn.count()) {
  await fsBtn.click();
  await page.waitForTimeout(700);
  // 全屏时菜单栏被 4px 热区 div 替代（无 header）
  const headerCount = await page.locator('header').count();
  ok('游戏全屏后菜单栏收起', headerCount === 0);
  const dockHidden = await page.locator('[aria-label="Finder"]').first().isHidden().catch(() => true);
  ok('全屏后 Dock 隐藏', dockHidden);
  // 鼠标到底部 → Dock 滑出
  await page.mouse.move(720, 895);
  await page.waitForTimeout(600);
  const dockShown = await page.locator('[aria-label="Finder"]').first().isVisible().catch(() => false);
  ok('鼠标到底部 Dock 滑出', dockShown);
  // 退出全屏
  await page.locator('button[title="退出全屏"]').first().click();
  await page.waitForTimeout(600);
  const headerRestored = (await page.locator('header').count()) > 0;
  ok('退出全屏菜单栏恢复', headerRestored);
} else {
  console.log('FAIL  未找到全屏按钮');
}

// 4. Wi-Fi 关闭 → Toast
await page.click('[aria-label="Wi-Fi 已连接"]').catch(async () => page.click('[aria-label="Wi-Fi 已关闭"]'));
await page.waitForTimeout(500);
const wifiSwitch = page.locator('[role="switch"][aria-label="Wi-Fi 开关"]');
await wifiSwitch.click();
await page.waitForTimeout(500);
const toastText = await page.locator('body').innerText();
ok('关闭 Wi-Fi 出现 Toast', toastText.includes('Wi-Fi 已关闭'));
// 重新打开
await page.click('[aria-label="Wi-Fi 已关闭"]').catch(async () => page.click('[aria-label="Wi-Fi 已连接"]'));
await page.waitForTimeout(300);
await page.locator('[role="switch"][aria-label="Wi-Fi 开关"]').click();
await page.keyboard.press('Escape');

// 5. 终端命令：theme / wifi / date
await page.getByRole('button', { name: '终端', exact: true }).first().click();
await page.waitForTimeout(700);
const input = page.locator('input[aria-label="终端输入"]');
const run = async (cmd) => {
  await input.click();
  await input.fill(cmd);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
};
await run('theme light');
ok('终端 theme light 生效', (await page.getAttribute('html', 'data-theme')) === 'light');
await run('theme dark');
ok('终端 theme dark 生效', (await page.getAttribute('html', 'data-theme')) === 'dark');
await run('wifi');
let body = await page.locator('body').innerText();
ok('终端 wifi 输出状态', body.includes('已连接') || body.includes('已关闭'));
await run('date');
body = await page.locator('body').innerText();
ok('终端 date 输出时间', /\d{4}/.test(body));
await run('echo hello-world');
body = await page.locator('body').innerText();
ok('终端 echo 回显', body.includes('hello-world'));
await run('badcmd');
body = await page.locator('body').innerText();
ok('终端未知命令报错', body.includes('command not found'));
await run('clear');
await page.waitForTimeout(300);
body = await page.locator('body').innerText();
ok('终端 clear 清屏', !body.includes('hello-world'));

// ---------- 移动端视口 ----------
const m = await browser.newPage({ viewport: { width: 375, height: 812 }, hasTouch: true });
await m.goto(BASE, { waitUntil: 'domcontentloaded' });
await m.waitForTimeout(900);
await m.getByRole('button', { name: 'Finder', exact: true }).first().click();
await m.waitForTimeout(700);
const winBox = await m.locator('[role="dialog"]').first().evaluate((el) => {
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
});
ok(`移动端窗口铺满 (${Math.round(winBox.x)},${Math.round(winBox.y)} ${Math.round(winBox.w)}x${Math.round(winBox.h)})`, winBox.x <= 1 && winBox.y >= 26 && winBox.w >= 373);
// 关闭窗口回桌面，打开游戏 → 摇杆 + 射击键
await m.keyboard.press('Control+w');
await m.waitForTimeout(400);
await m.getByRole('button', { name: '太空射击', exact: true }).first().click();
await m.waitForTimeout(1200);
await m.getByRole('button', { name: '开始游戏', exact: true }).first().click();
await m.waitForTimeout(700);
const joystick = await m.locator('[aria-label="虚拟摇杆"]').count();
const fireBtn = await m.locator('button[aria-label="射击"]').count();
ok('移动端虚拟摇杆出现', joystick > 0);
ok('移动端射击键出现', fireBtn > 0);

console.log(`\nCONSOLE_ERRORS(${errors.length}):`);
for (const e of errors) console.log('  ' + e);
await browser.close();
console.log('DONE');
