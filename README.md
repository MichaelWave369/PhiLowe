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