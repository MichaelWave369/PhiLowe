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
    // Director's Cut begins with one immediately playable reel.
    const cinema = page.locator('#directors-cut');
    const coldOpen = cinema.locator('.director-reel').filter({hasText:'The Rehearsal That Escaped'});
    await coldOpen.waitFor({timeout:10000});
    if (!(await coldOpen.isEnabled())) throw new Error('Director cold open was not unlocked.');
    await cinema.locator('.director-take-buttons').getByRole('button',{name:/ROLL THE FUNNY TAKE/}).click();
    await cinema.locator('.director-variant').getByText(/rubber chicken/i).waitFor({timeout:5000});

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
    // Rung 7: real browser interaction, lane-choice results, and Mabel's ledger.
    await page.getByRole('button', { name: /THROW A TOMATO/ }).click();
    await page.locator('.club-tomato-readout').getByText(/INCOMING TOMATO: CENTER/).waitFor({ timeout: 5000 });
    await page.getByRole('button', { name: 'Dodge left' }).click();
    await page.locator('.club-tomato-readout').getByText(/DODGED/).waitFor({ timeout: 5000 });
    await page.getByRole('button', { name: /THROW A TOMATO/ }).click();
    await page.locator('.club-tomato-readout').getByText(/INCOMING TOMATO: RIGHT/).waitFor({ timeout: 5000 });
    await page.getByRole('button', { name: 'Dodge right' }).click();
    await page.locator('.club-tomato-readout').getByText(/SPLAT/).waitFor({ timeout: 5000 });
    if (await page.locator('.club-manager-reports article').count() !== 2)
      throw new Error('Mabel did not file both tomato incident reports.');
    const downloadEvent = page.waitForEvent('download');
    await page.getByRole('button', { name: /EXPORT REPORTS/ }).click();
    const reportDownload = await downloadEvent;
    if (!reportDownload.suggestedFilename().endsWith('.json'))
      throw new Error('Incident export did not produce a JSON archive.');
    if (await page.locator('.club-badge.unlocked').count() < 2)
      throw new Error('Club achievements were not awarded.');

    // Rung 8: complete the full six-room point-and-click quest in a real browser.
    const quest = page.locator('#backstage');
    const room = async name => quest.locator('.backstage-map').getByRole('button', { name: new RegExp(name, 'i') }).click();
    const action = async name => quest.locator('.backstage-buttons').getByRole('button', { name: new RegExp(name, 'i') }).click();
    await room('The Secret Encore');
    await quest.locator('.backstage-narrator').getByText(/STAGE LOCKED/).waitFor({timeout:5000});
    await room("Mabel's Office");
    await action('SIGN FORM LOL-404');
    await quest.locator('.backstage-narrator').getByText(/mandatory briefing/).waitFor({timeout:5000});
    await action('ASK MABEL FOR THE BRIEFING');
    await action('SIGN FORM LOL-404');
    await room('Hallway of Regrets');
    await action('SEARCH VENDING MACHINE');
    await room('Prop Closet 369');
    await action('BUY A 9V BATTERY');
    await action('REPAIR SPARE MICROPHONE');
    await room('Lighting Booth');
    await action('PRESS PINK SWITCH');
    await quest.locator('.backstage-narrator').getByText(/Wrong color/).waitFor({timeout:5000});
    await action('PRESS GOLD SWITCH');
    await action('PRESS PINK SWITCH');
    await action('PRESS CYAN SWITCH');
    await quest.locator('.backstage-narrator').getByText(/LIGHT CUE COMPLETE/).waitFor({timeout:5000});
    await room("Mabel's Office");
    await action('REQUEST FINAL STAGE PASS');
    await room('The Secret Encore');
    await action('PERFORM THE GRAND ENCORE');
    await quest.getByRole('heading', {name:/THE LAUGH WAS THE QUEST/}).waitFor({timeout:5000});
    // Completing Rung 8 immediately unlocks a playable extra scene.
    const encoreReel = cinema.locator('.director-reel').filter({hasText:'Mabel Takes the Bow'});
    await encoreReel.click();
    await cinema.locator('.director-take-buttons').getByRole('button',{name:/LET MABEL TAKE THE BOW/}).click();
    await cinema.locator('.director-variant').getByText(/audience applauds/i).waitFor({timeout:5000});

    // Progress and unlock state must survive refresh, then be safely reset.
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('#backstage .backstage-victory').waitFor({timeout:10000});
    await page.locator('#backstage .backstage-victory').getByRole('button',{name:/PLAY AGAIN/}).click();
    await quest.getByRole('button',{name:/CONFIRM RESTART/}).first().click();
    await quest.locator('.backstage-victory').waitFor({state:'detached',timeout:5000});
    if (!(await encoreReel.isEnabled()))
      throw new Error('Earned Director scene was lost when Backstage Mayhem restarted.');


    // Rung 9: full Case 404 detective playthrough, including false lead and
    // keypad error, gated witness dialogues, resolution, persistence and reset.
    const detective = page.locator('#case404');
    const caseRoom = async name => detective.locator('.case404-map')
      .getByRole('button',{name:new RegExp(name,'i')}).click();
    const caseAction = async name => detective.locator('.case404-action-grid')
      .getByRole('button',{name:new RegExp(name,'i')}).click();
    const caseChoice = async name => detective.locator('.case404-dialogue-choices')
      .getByRole('button',{name:new RegExp(name,'i')}).click();
    await caseRoom('Secret Passage 404');
    await detective.locator('.case404-narrator').getByText(/SECRET PASSAGE LOCKED/).waitFor({timeout:5000});
    await caseAction('INSPECT WHEEL TRACKS');
    await caseRoom("Mabel's Office");
    await caseAction('INSPECT FORM 404-C');
    await caseAction('QUESTION MABEL');
    await caseChoice('ASK HOW SHE FEELS ABOUT THE LETTERS');
    await caseRoom('Prop Closet 369');
    await caseAction('INSPECT FALSE WALL HINGE');
    await caseAction('QUESTION BIX');
    await caseChoice('ASK ABOUT THE MOTORIZED CABINET');
    await caseAction('FOLLOW TRACKS TO SECRET HINGE');
    await caseAction('KEYPAD 4');
    await caseAction('KEYPAD 8');
    await detective.locator('.case404-narrator').getByText(/Wrong digit/).waitFor({timeout:5000});
    await caseAction('KEYPAD 4');
    await caseAction('KEYPAD 0');
    await caseAction('KEYPAD 4');
    await detective.locator('.case404-narrator').getByText(/CODE 404 ACCEPTED/).waitFor({timeout:5000});
    await caseRoom('Dressing Rooms');
    await caseAction('INSPECT MIRROR MESSAGE');
    await caseAction('QUESTION VERA');
    await caseChoice('ASK WHY THE LETTERS MATTER');
    await caseRoom('Sound Booth');
    await caseAction('INSPECT OVERNIGHT RECORDING');
    await caseAction('QUESTION DJ');
    await caseChoice('LISTEN TO THE COMPLETE TAPE');
    await caseRoom('Secret Passage 404');
    await caseAction('INSPECT THE CABINET LETTER');
    await caseAction('CONCLUDE: BIX STOLE');
    await detective.locator('.case404-narrator').getByText(/FALSE LEAD/).waitFor({timeout:5000});
    await caseAction('CONCLUDE: THE CABINET MOVED ITSELF');
    await detective.locator('.case404-narrator').getByText(/CASE SOLVED/).waitFor({timeout:5000});
    await caseAction('FINAL CHOICE: OPEN A GALLERY OF GOOD DAYS');
    await detective.locator('.case404-conclusion').getByRole('heading',{name:/THE GALLERY OF GOOD DAYS/}).waitFor({timeout:5000});
    // The gallery reel and the crossover finale require real Case404 progress
    // and the previously earned Backstage Encore milestone.
    const galleryReel = cinema.locator('.director-reel').filter({hasText:'Gallery of Good Days: The Extra Scene'});
    const crossoverReel = cinema.locator('.director-reel').filter({hasText:'The Last Laugh'});
    await galleryReel.click();
    await cinema.locator('.director-take-buttons').getByRole('button',{name:/RAISE THE WELCOME BANNER/}).click();
    await cinema.locator('.director-variant').getByText(/KEEP THE LAUGH/).waitFor({timeout:5000});
    await crossoverReel.click();
    await cinema.locator('.director-take-buttons').getByRole('button',{name:/ROLL CREDITS FOR EVERYONE/}).click();
    await cinema.locator('.director-variant').getByText(/person holding the controller/).waitFor({timeout:5000});

    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('#case404 .case404-conclusion').waitFor({timeout:10000});
    if (!(await page.locator('#directors-cut .director-reel').filter({hasText:'The Last Laugh'}).isEnabled()))
      throw new Error('Director crossover reel did not persist on refresh.');
    if (!(await page.locator('#directors-cut .director-reel').filter({hasText:'Mabel Takes the Bow'}).isEnabled()))
      throw new Error('Director Encore reel did not persist after game restart.');

    await detective.getByRole('button',{name:'↻ OPEN A NEW CASE'}).click();
    await detective.getByRole('button',{name:'CONFIRM NEW CASE'}).click();
    await detective.locator('.case404-conclusion').waitFor({state:'detached',timeout:5000});
    if (!(await crossoverReel.isEnabled()))
      throw new Error('Director finale was lost after resetting Case404.');



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
    if (await page.locator('.club-manager-reports article').count() !== 2)
      throw new Error('Mabel incident ledger did not persist across page refresh.');
    await page.getByRole('button', { name: 'CLEAR REPORTS' }).click();
    await page.getByRole('button', { name: 'CONFIRM CLEAR' }).click();
    await page.locator('.club-no-reports').waitFor({ timeout: 5000 });

    if (errors.length) throw new Error('Browser JavaScript errors:\n' + errors.join('\n'));
    console.log('PASS: React mounted, terminal rendered, Comedy Club tomato dodges/ledger, props/duel/badges, full six-room Backstage quest, Case 404 investigation, Director's Cut unlocks and replay, and writer persisted, no page errors. Base: ' + base);
  } finally {
    if (browser) await browser.close();
    server.kill('SIGTERM');
  }
}
await run();
