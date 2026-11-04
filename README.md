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
