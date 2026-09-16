# Ghar ka Khana — Meal Planner (PWA)

A installable, offline-capable web app. No build step — plain HTML/JS, React and Babel
loaded from a CDN at runtime.

## Deploy to GitHub Pages (5 minutes)

1. Create a new **public** repository on GitHub — e.g. `meal-planner`.
2. Upload all files in this folder to the repo root:
   `index.html`, `app.jsx`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`,
   `apple-touch-icon.png`.
   - Easiest way: on the repo's GitHub page, click **Add file → Upload files**, drag
     all of them in, and commit.
3. Go to **Settings → Pages** in the repo.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Branch: `main`, folder: `/ (root)`. Click **Save**.
6. Wait ~1 minute, then your app is live at:
   `https://<your-username>.github.io/<repo-name>/`

## Install it on your phone

- **Android (Chrome):** open the link above → menu (⋮) → **Add to Home screen**.
- **iPhone (Safari):** open the link above → Share icon → **Add to Home Screen**.

Once added, it opens full-screen like a regular app, works offline after the first
load, and the icon on your home screen is the "GK" mark.

## Important: where your data lives

This app has **no server and no login** — it stores your recipes, weekly plan, and
household size in the browser's local storage, on that one device.

- If you add it to your phone's home screen and your spouse adds it to theirs,
  **you'll each have your own separate plan** — they don't sync.
- Clearing your browser's site data/cache for this app will erase everything.
- There's no cloud backup in this version. If you want one shared plan across the
  family, the natural next step is a small backend (e.g. a free Supabase project) —
  worth doing once you know the app is one you'll keep using.

## Updating it later

Whenever you (or I) change `app.jsx`, just re-upload the changed file(s) to the
same GitHub repo (commit again) — GitHub Pages redeploys automatically in
about a minute. Existing installs will pick up the change next time they're
opened online.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page shell, loads React/Babel from CDN, mounts the app |
| `app.jsx` | The entire app — recipes, generator, and all screens |
| `manifest.json` | PWA metadata (name, icon, colors) — enables "Add to Home Screen" |
| `sw.js` | Service worker — caches the app so it works offline |
| `icon-*.png` | App icons |
