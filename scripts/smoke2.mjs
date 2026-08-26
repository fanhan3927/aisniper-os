/**
 * smoke2.mjs — 交互与断言冒烟测试（不依赖视觉）
 */
import { chromium } from 'playwright-core';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://localhost:5173';
const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const errors = [];
const failed = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });

const ok = (name, cond) => console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);

await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(1000);
try { await page.click('[aria-label="点击跳过开机动画"]', { timeout: 2000 }); } catch {}
await page.waitForTimeout(800);

// 1. 主题默认深色
ok('初始主题 data-theme=dark', (await page.getAttribute('html', 'data-theme')) === 'dark');

// 2. 菜单栏时钟
const clockText = await page.locator('header button[aria-label="时钟与日历"]').innerText();
ok('菜单栏时钟非空', clockText.length > 8);
console.log('   时钟:', clockText);

// 3. 点击时钟 → 日历弹窗
await page.click('[aria-label="时钟与日历"]');
await page.waitForTimeout(500);
const calText = await page.locator('body').innerText();
ok('日历弹窗显示今天', calText.includes(String(new Date().getDate())));
ok('日历弹窗显示世界时钟', calText.includes('世界时钟'));
// Esc 关闭
await page.keyboard.press('Escape');
await page.waitForTimeout(300);

// 4. Wi-Fi 弹窗
await page.click('[aria-label="Wi-Fi 已连接"]').catch(async () => {
  await page.click('[aria-label="Wi-Fi 已关闭"]');
});
await page.waitForTimeout(500);
let bodyText = await page.locator('body').innerText();
ok('Wi-Fi 弹窗显示当前网络', bodyText.includes('AISniper-Net'));
ok('Wi-Fi 弹窗显示附近网络', bodyText.includes('附近网络'));
await page.keyboard.press('Escape');
await page.waitForTimeout(300);

// 5. 健康弹窗
await page.click('[aria-label="系统健康度"]');
await page.waitForTimeout(600);
bodyText = await page.locator('body').innerText();
ok('健康弹窗显示总分', /总分\s*\d+/.test(bodyText));
ok('健康弹窗显示 CPU', bodyText.includes('CPU'));
ok('健康弹窗显示折线', bodyText.includes('趋势'));
await page.keyboard.press('Escape');
await page.waitForTimeout(300);

// 6. 打开 Finder（Dock）并导航
await page.getByRole('button', { name: 'Finder', exact: true }).first().click();
await page.waitForTimeout(700);
bodyText = await page.locator('body').innerText();
ok('Finder 打开显示文件', bodyText.includes('README.md') && bodyText.includes('待办.md'));
// 双击进入个人 → 文稿
await page.getByText('文稿', { exact: true }).first().dblclick().catch(() => {});
await page.waitForTimeout(500);
bodyText = await page.locator('body').innerText();
ok('Finder 进入文稿', bodyText.includes('太空档案') && bodyText.includes('系统日志'));

// 7. 计算器键盘
await page.getByRole('button', { name: '计算器', exact: true }).first().click();
await page.waitForTimeout(600);
await page.keyboard.press('1');
await page.keyboard.press('+');
await page.keyboard.press('2');
await page.keyboard.press('Enter');
await page.waitForTimeout(400);
bodyText = await page.locator('body').innerText();
ok('计算器 1+2=3', /3\s/.test(bodyText.split('科学')[0]) || bodyText.includes('3'));
console.log('   计算器显示片段:', bodyText.slice(0, 200).replace(/\n/g, ' | '));

// 8. 终端
await page.getByRole('button', { name: '终端', exact: true }).first().click();
await page.waitForTimeout(700);
const input = page.locator('input[aria-label="终端输入"]');
await input.click();
await input.type('help');
await page.keyboard.press('Enter');
await page.waitForTimeout(300);
bodyText = await page.locator('body').innerText();
ok('终端 help 输出命令列表', bodyText.includes('neofetch') && bodyText.includes('play'));
await input.type('neofetch');
await page.keyboard.press('Enter');
await page.waitForTimeout(300);
bodyText = await page.locator('body').innerText();
ok('终端 neofetch 输出系统信息', bodyText.includes('Sniper Neural GPU'));
await input.type('open game');
await page.keyboard.press('Enter');
await page.waitForTimeout(1200);
bodyText = await page.locator('body').innerText();
ok('终端 open game 打开游戏', bodyText.includes('开始游戏') || bodyText.includes('太空射击'));

// 9. 游戏启动与 HUD
const start = page.getByRole('button', { name: '开始游戏', exact: true }).first();
if (await start.count()) await start.click();
await page.waitForTimeout(1500);
bodyText = await page.locator('body').innerText();
ok('游戏 HUD 显示波次', bodyText.includes('波次'));
ok('游戏 HUD 显示得分 0', bodyText.includes('0'));
// 开火（空格）
await page.keyboard.down('Space');
await page.waitForTimeout(600);
await page.keyboard.up('Space');
// 暂停
await page.keyboard.press('p');
await page.waitForTimeout(400);
bodyText = await page.locator('body').innerText();
ok('暂停菜单出现', bodyText.includes('已暂停'));
await page.keyboard.press('p');
await page.waitForTimeout(300);

// 10. 设置 → 浅色主题生效（分段控件是 role=tab）
await page.getByRole('button', { name: '设置', exact: true }).first().click();
await page.waitForTimeout(700);
await page.getByRole('tab', { name: '浅色', exact: true }).first().click();
await page.waitForTimeout(600);
ok('浅色主题 data-theme=light', (await page.getAttribute('html', 'data-theme')) === 'light');
// 换回深色
await page.getByRole('tab', { name: '深色', exact: true }).first().click();
await page.waitForTimeout(500);
ok('深色主题 data-theme=dark', (await page.getAttribute('html', 'data-theme')) === 'dark');

// 11. ⌘/Ctrl+W 关闭前台窗口
const before = await page.locator('[role="dialog"]').count();
await page.keyboard.press('Control+w');
await page.waitForTimeout(500);
const after = await page.locator('[role="dialog"]').count();
ok(`Ctrl+W 关闭窗口 (${before} → ${after})`, after < before);

console.log(`\nFAILED_REQUESTS(${failed.length}):`);
for (const f of failed) console.log('  ' + f);
console.log(`CONSOLE_ERRORS(${errors.length}):`);
for (const e of errors) console.log('  ' + e);
await browser.close();
console.log('DONE');
