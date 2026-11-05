# PhiLowe

**A love letter in pixels to Al Lowe.** An independently made, fan-created tribute to a pioneer of comedy adventure games and the notion that a game can make a hard day a little easier.

## What's inside

- An original, responsive retro-inspired landing page (no copyrighted game assets)
- Historical career timeline with links to Al Lowe's own website
- A tiny, playable, original point-and-click-style comedy adventure
- A fake terminal with discoverable commands
- Optional synthesized UI sound, off by default
- Tribute letter written by Michael Wave of Phi369 Labs

## Local development

Requires Node.js 20.19+ (or Node.js 22.12+).

```bash
npm install
npm run dev
npm run build
```

## Deployment

This is a static React + Vite SPA with `netlify.toml` committed. Connect this repository to Netlify, use `npm run build`, and publish `dist`. The same `dist` can be deployed to another static host.

### GitHub Pages

After merging PR #1, choose **Settings → Pages → Build and deployment → Source: GitHub Actions**. The included `.github/workflows/pages.yml` builds with base `/PhiLowe/` and automatically publishes on `main` pushes to `https://michaelwave369.github.io/PhiLowe/` once Pages is enabled. This URL is a deployment target, not a claim that a deploy already exists.

## Historical links

Primary source: [Al Lowe's Humor Site](https://allowe.com/) and the original [biography](https://allowe.com/al/bio1.html), [game information](https://allowe.com/welcome.html), and [discography](https://allowe.com/al/discography.html).

## Respect & rights

This is an **unofficial fan tribute** and not an Al Lowe, Sierra, or Leisure Suit Larry production. All original page illustrations, interface elements, and the playable mini-adventure are created for PhiLowe. Names of third-party games appear for historical reference only. No game executables, logos, character sprites, or copyrighted artwork are redistributed. No affiliation, permission, or endorsement is implied.

© 2026 Phi369 Labs. MIT license for this original website source; trademarks and third-party works remain with their respective owners.

## CyberJoke 3690 (v2)

The Laugh Lounge now contains **112 original jokes** split into eight categories. It includes a setup/reveal/punchline stage, a no-repeat shuffle-bag player, live joke search, a mini archive, audience heckles, personal laugh/groan reactions, favorites saved in browser local storage, and clipboard sharing. No external service or tracking is needed.

In the retro terminal, run `JOKE`, `JOKE VR`, `JOKE RETRO`, `JOKE LOVE`, `JOKES`, or `HECKLE`. `JOKES` lists all departments. `npm test` checks archive integrity and no-repeat behavior. All jokes are independently written for this project, not Al Lowe quotations or game text.


## Writer Room (v3)

The independent fan tribute now has an offline-first **Writer Room** at `#writers-room`. Write, edit, and privately annotate your own jokes; choose either **Draft** (writer-only) or **On Stage** (appears in the Laugh Lounge and `JOKE MINE` in the terminal on this device). Browse and filter your vault, and export/import validated, versioned JSON backups. Imports merge without replacing existing jokes and skip duplicate setups/punchlines. Maximum 500 local jokes. No login, backend, or submissions to an external service. Because browser storage can be cleared, export backups regularly.

`npm test` now includes tests for schema validation, create/update/delete, stage visibility, backup round trips, duplicate safety, and import limits.


## Comedy Club (v4)

The **PhiLowe Comedy Club** is a standalone, offline-first, single-player, simulated pixel-art theater at `#comedy-club`. Four **original** comedians (Bix Binary, Vera Velvet, Professor Plotwick, DJ Parallax) take turns performing jokes from their specialties. If you have Writer Room jokes marked **On Stage**, a fifth Open Mic performer appears automatically on the roster and delivers your original material. Private drafts are excluded.

Use **Start the Show**, **Reveal Punchline**, **Next Comedian**, **Applaud**, **Groan**, and **Heckle**. Each performer has personality-specific intros and original heckle responses. Optional **Auto Show** cycles every 4.8 seconds for setups and 6.4 seconds for punchlines; it is off by default and cleans up its timers. Keyboard shortcuts when the stage has focus: N (next), R (reveal), H (heckle). The local audience scoreboard and six-act show log are not posted to a server. Comedians are fictional creations of Phi369 Labs, not characters belonging to Al Lowe or Sierra.

`npm test` validates cast rotation, department restrictions, shuffle-bag nonrepetition, local open-mic behavior, and audience labeling. This is **not** a networked room, live show, or VR headset implementation yet.


## Audience Chaos (v5)

The pixel Comedy Club now has interactive slapstick and a heckler minigame. **Four single-use-per-act stage props** (rubber chicken, banana peel, confetti cannon, trapdoor) produce animated, screen-reader-announced stage events. **Heckler Duels** present a three-option original comeback challenge for each comedian, including your local Open Mic performer. Each act offers one chance for a 100-point win; wrong answers stay in the backstage incident log and the next act offers a fresh attempt.

Seven **Achievements** unlock through play: Curtain Call, Props to You, Master of Disaster, Comeback Kid, Crowd Pleaser, Ten Act Wonder, and The Writer Is In. The trophy cabinet persists only in browser `localStorage`; no accounts or backend. Session scores reset on reload. Keyboard shortcuts when the club itself is focused: `N` next act, `R` reveal, `H` heckle, `P` rubber chicken, `D` open duel. No props can fire until an act begins. The extra animations respect reduced-motion preferences.

The CI browser smoke tests for both `/` and `/PhiLowe/` now exercise prop controls, duel choices, badge persistence, show progression, and the Writer Room. All content and comedy characters are original and remain independent of Al Lowe's games and copyrighted assets.


## Tomato Night & Mabel's Incident Desk (Rung 7)

The club now features an interactive **Tomato Night** round. Up to three tomatoes can be thrown during an act. Each throw openly announces whether the incoming lane is LEFT, CENTER or RIGHT, and the visitor selects a different lane to help the performer dodge. Choosing the targeted lane produces a funny, harmless splat. Every throw requires a button press and every dodge a player choice; the game doesn't automatically throw objects.

Original character **Mabel Carbon-Copy, Senior Director of Preventable Incidents** files comic incident reports for dodges and splats. The most recent 30 validated reports live in local browser storage, can be exported as JSON, and can be deleted through a two-step confirmation. A browser refresh retains the reports, not the live per-act score. No telemetry, accounts, external services, or actual physical interactions are involved. Reduced-motion support removes the projectile animation, and the controls are keyboard accessible.

CI's full Chromium smoke run verifies tomato controls, both dodge outcomes, JSON report downloads, persistence, and explicit clearing on both `/` and GitHub Pages `/PhiLowe/`. New Node tests cover lane sequencing, safe resolution, validation and report storage.


## Backstage Mayhem (Rung 8)

The new `#backstage` section is a self-contained, offline point-and-click comedy adventure. Explore **six original pixel rooms**: Hallway of Regrets, Mabel's Office, Prop Closet 369, Dressing Rooms, Lighting Booth, and the locked Secret Encore. The backstage map, inventory, room conversations, narration, quest checklist, hints and six collectible original joke notes make the club feel like a little explorable adventure game.

**Quest:** receive Mabel's safety briefing, sign Form LOL-404, find a vending coin, purchase a 9V battery, repair the backup microphone, program the booth colors in the order GOLD → PINK → CYAN, obtain Mabel's stage pass and perform the final encore. Optional: collect all six joke notes and gift a rubber chicken to Bix Binary. You cannot enter the Secret Encore without completing the first three tasks and obtaining final clearance.

Progress, collected notes, visits and quest flags are stored **only in browser localStorage**, with schema checks and a two-step restart confirmation. No server, accounts, or uploads. If the browser data is cleared, the adventure starts over. The cast, puzzles, dialogue, artwork and notes are original to this independent fan tribute.

CI includes pure Node tests for state transitions, puzzles, gating, collectibles and save validation, plus a headless Chromium smoke test on both site-root and GitHub Pages subpath. The browser test follows the quest from a locked stage to the secret finale and verifies that it persists and can be reset.


## Case 404: The Missing Master Cabinet (Rung 9)

The standalone `#case404` investigation adds a second original adventure to PhiLowe, separate from your Backstage Mayhem save. A master filing cabinet has vanished. Search six scenes, uncover six evidence cards, and interview **Mabel Carbon-Copy, Bix Binary, Vera Velvet, and DJ Parallax**. Each witness offers two dialogue approaches, and the final epilogue reacts to whether you listened or accused.

Find wheel tracks, a transfer form and a false wall hinge before revealing the prop closet keypad. Crack **404** to open the secret passage, then examine the cabinet's letter. Accuse Mabel, Bix or the cabinet itself; wrong theories can be corrected. Once enough evidence and statements are gathered, discover the cabinet's unusual reason for moving itself, then choose either **The Gallery of Good Days** or **The Archive of Quiet Joy** as your final outcome.

This is a fictional comedy mystery. The story contains no actual visitor letters. Progress, evidence, witness decisions, wrong guesses and the chosen ending remain in local browser storage, with validation and a confirmed new-case reset. There is no server, account, tracking or public upload. Existing Joke Writer, Club, Backstage Mayhem and trophy saves are untouched.

CI adds Node tests for the mystery state machine, branching witnesses, evidence rules, keypad mistakes, false accusations, endings, save validation, and an actual Chromium browser playthrough of the entire mystery at both `/` and `/PhiLowe/`.
