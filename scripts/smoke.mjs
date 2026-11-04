import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const usePagesBase = process.argv.includes('--pages');
const base = usePagesBase ? '/PhiLowe/' : '/';
const url = 'http://127.0.0.1:4173' + base;
const viteArgs = ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort', '--base', base];
const server = spawn(process.execPath, viteArgs, { stdio: ['ignore', 'pipe', 'pipe'] });
let output = '';
server.stdout.on('data', data => { output += data; });
server.stderr.on('data', data => { output += data; });
let browser = null;
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
async function findChrome() {
  if (process.env.CHROME_BIN) return process.env.CHROME_BIN;
  for (const path of ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser']) {
    try { await access(path); return path; } catch { /* try next */ }
  }
  return null;
}
async function waitForServer() {
  for (let i = 0; i < 80; i++) {
    if (server.exitCode !== null) throw new Error('Preview server exited early:\n' + output);
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch { /* not yet listening */ }
    await sleep(250);
  }
  throw new Error('Preview server did not start:\n' + output);
}
async function run() {
  try {
    await waitForServer();
    const executablePath = await findChrome();
    browser = await chromium.launch(executablePath
      ? { executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] }
      : { channel: 'chrome', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    if (!response?.ok()) throw new Error('Page did not load: ' + response?.status());
    await page.locator('#hero-title').waitFor({ timeout: 15000 });
    const heading = await page.locator('#hero-title').innerText();
    if (!heading.includes('THE LAUGH')) throw new Error('Main hero did not render: ' + heading);
    await page.getByText(/PHILOWE BIOS v1\.0/).waitFor({ timeout: 10000 });
    await page.getByRole('button', { name: /START THE SHOW/ }).click();
    await page.locator('.club-controls').getByRole('button', { name: /REVEAL PUNCHLINE/ }).click();
    const comedian = page.locator('.club-speaker span').first();
    if (!(await comedian.innerText()).includes('BIX BINARY')) throw new Error('Comedy Club did not start with Bix.');
    // Browser interaction tests protect against the blank-screen regressions:
    // React must actually mount and the brand-new game controls must work.
    await page.getByRole('button', { name: 'Trigger rubber chicken' }).click();
    await page.locator('.club-prop-cue').getByText(/rubber chicken/i).waitFor({ timeout: 5000 });
    await page.getByRole('button', { name: 'OPEN HECKLER DUEL' }).click();
    await page.locator('.club-duel-question').waitFor({ timeout: 5000 });
    if (await page.locator('.club-duel-choices button').count() !== 3)
      throw new Error('Heckler challenge did not show three choices.');
    await page.locator('.club-duel-choices button').first().click();
    await page.locator('.club-duel-result').waitFor({ timeout: 5000 });
    await page.locator('.club-badge.unlocked').first().waitFor({ timeout: 5000 });
    await page.locator('.club-controls').getByRole('button', { name: /NEXT COMEDIAN/ }).click();
    await page.getByRole('button', { name: 'Trigger banana peel' }).click();
    await page.locator('.club-chaos-effect.chaos-banana').waitFor({ timeout: 5000 });
    if (await page.locator('.club-badge.unlocked').count() < 2)
      throw new Error('Club achievements were not awarded.');

    const setup = 'Why did the floppy disk visit the comedy club?';
    const punchline = 'To prove its timing was still magnetic.';
    await page.locator('#writer-editor textarea').nth(0).fill(setup);
    await page.locator('#writer-editor textarea').nth(1).fill(punchline);
    await page.getByRole('button', { name: /SAVE JOKE/ }).click();
    await page.getByText(setup).first().waitFor({ timeout: 10000 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByText(setup).first().waitFor({ timeout: 10000 });
    if (await page.locator('.club-badge.unlocked').count() < 2)
      throw new Error('Club achievements did not persist across page refresh.');

    if (errors.length) throw new Error('Browser JavaScript errors:\n' + errors.join('\n'));
    console.log('PASS: React mounted, terminal rendered, Comedy Club props/duel/badges worked and persisted, writer saved and persisted, no page errors. Base: ' + base);
  } finally {
    if (browser) await browser.close();
    server.kill('SIGTERM');
  }
}
await run();
