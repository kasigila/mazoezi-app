# MAZOEZI

**75-Day Structured Discipline Protocol.**

A production-ready PWA for controlled transformation through consistency, accountability, and measurable standards.

## Quick Start

1. **Visit the site**: [mazoezi-app live](https://kasigila.github.io/mazoezi-app/)
2. Flow: Welcome → Sign up → Select Challenge → Dashboard

Everything runs in the browser. No local server or backend required. If the link returns 404, enable GitHub Pages in **Settings > Pages** (Deploy from branch `main`, folder `/ (root)`). See [SETUP.md](SETUP.md) for details.

## Full Setup

See **[SETUP.md](SETUP.md)** for GitHub Pages, PWA, and deployment.

## Stack

- HTML, CSS, Vanilla JS (modular)
- localStorage + IndexedDB (no backend)
- Font Awesome, Chart.js
- No frameworks

## Project Structure

```
/
  index.html              Welcome
  signup.html             Account creation
  login.html              Log in
  challenge-selection.html Challenge cards, custom config
  dashboard.html          Main app
  challenges.js           Goal library, challenge definitions
  challenge-selection.js  Challenge selection logic
  app.js                  Dashboard, XP, relapse, proof
  auth.js                 Local session auth
  storage.js              localStorage + IndexedDB
  protocol.js             Grace, streak helpers
  discipline-score.js     Score calculation
  momentum.js             7-day momentum
  relapse.js              Relapse intelligence
  camera.js               In-app camera (getUserMedia)
  analytics.js            Charts, heatmap
  manifest.json, service-worker.js
  styles.css, landing.css
  assets/icons/
```
