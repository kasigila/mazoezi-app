# MAZOEZI Setup Guide

Complete instructions for GitHub Pages deployment. **No Firebase, no backend** — everything runs in the browser with localStorage and IndexedDB.

---

## 1. How It Works

- **Auth**: Simple session in `localStorage` — one user per device. No passwords stored; sign up / log in just creates a local session.
- **Data**: Profile, days, completions, cycles → `localStorage`. Proof photos → IndexedDB.
- **Hosting**: Static files only. Works on GitHub Pages, Netlify, Vercel, or any static host.

---

## 2. GitHub Pages Deployment

### Enable Pages (required)

1. Push this project to a GitHub repository
2. Go to the repo: **Settings > Pages**
3. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **main** (or **master**)
   - Folder: **/ (root)**
4. Click **Save**. Wait 1–2 minutes for the first deploy.
5. The site will be at `https://<username>.github.io/<repo>/`

If you get 404, check Settings > Pages and confirm the source branch/folder.

### Option B: Custom Domain

Add a `CNAME` file in the root with your domain (e.g. `mazoezi.com`), then configure DNS.

### Base Path

If your site is at `https://user.github.io/mazoezi-app/`:

- In `manifest.json`: `"start_url": "./index.html"` (relative paths work)
- All internal links use relative paths (`./dashboard.html`)

---

## 3. Install as PWA

1. Open the app in Chrome/Safari
2. Chrome: Menu (3 dots) > **Install app** or **Add to Home screen**
3. Safari (iOS): Share > **Add to Home Screen**

---

## 4. Generate App Icons

The manifest references PNG icons. Generate them:

1. **If the site is live:** Open `https://<username>.github.io/mazoezi-app/generate-icons.html`
2. **If Pages isn't set up yet:** Clone the repo, then double-click `generate-icons.html` (or drag it into a browser)
3. Click each size button to download
4. Save files as `icon-72.png`, `icon-96.png`, etc. in `assets/icons/`

Or use any 512×512 PNG and resize for each size. The manifest expects:

- `assets/icons/icon-72.png`
- `assets/icons/icon-96.png`
- `assets/icons/icon-128.png`
- `assets/icons/icon-144.png`
- `assets/icons/icon-192.png`
- `assets/icons/icon-512.png`

---

## 5. Notifications

- **Local notifications**: Toggle Reminders on the dashboard. Works when the tab is open.
- **Push notifications**: Would require a backend or service (e.g. Firebase Cloud Messaging). Not included in this setup.

---

## 6. Deploying Updates

### Service Worker Cache

The service worker uses versioned cache: `mazoezi-v1.1.0`. To force a refresh:

1. In `service-worker.js`, change:
   ```js
   const CACHE_NAME = 'mazoezi-v1.1.1';
   ```
2. Users receive the new SW on the next visit; old cache is cleared on activate

### Best Practices

1. Bump `CACHE_NAME` version for each release
2. Test locally before pushing
3. Clear site data (DevTools > Application > Storage > Clear site data) if testing cache issues

---

## 7. Project Structure

```
/
  index.html              Landing page
  login.html              Log in
  signup.html              Sign up
  challenge-selection.html Challenge picker
  dashboard.html           Main app
  manifest.json            PWA manifest
  service-worker.js        PWA + offline
  styles.css               Dashboard styles
  landing.css              Landing + auth styles
  auth.js                  Local session auth
  storage.js               localStorage + IndexedDB
  app.js                   Main app logic
  challenge-selection.js   Challenge selection
  protocol.js              Grace period, streak logic
  discipline-score.js      Score calculation
  momentum.js              Momentum state
  relapse.js               Relapse analysis
  analytics.js             Charts, heatmap
  camera.js                Photo capture
  challenges.js            Challenge definitions
  assets/
    icons/                 App icons
```

---

## 8. Troubleshooting

| Issue | Fix |
|-------|-----|
| Site or pages return 404 | Enable GitHub Pages: repo **Settings > Pages** > Deploy from branch **main** and folder **/ (root)**. Wait 1–2 min. |
| Data lost on clear browser data | Data is local only. Export JSON from Settings for backup. |
| Icons not showing in install prompt | Add all manifest icon sizes; regenerate with `generate-icons.html` |
| Offline not working | Serve over HTTPS/localhost; check service worker registration |
| Charts blank | Chart.js loads from CDN; check console for errors |
| Session lost on refresh | Check that `localStorage` is not blocked (private mode, strict settings) |

---

## 9. Data Backup

- **Export JSON**: Settings > Export JSON — downloads profile, days, completions, XP, cycles
- **Export Monthly**: Settings > Export HTML Summary — downloadable report
- **Import**: Settings > Import backup — restores from a previously exported JSON file
