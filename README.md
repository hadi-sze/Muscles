# Muscle — React recreation

A responsive recreation of the Muscle muscle-map interface, built with React 19 and Vite. Full right-to-left layout with a right-side navigation rail, mirrored header and workspace, Persian controls, front/back body diagrams, male/female models, keyboard-selectable muscles, equipment filters, exercise search, local saved exercises, and a rest timer.

## Run

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

The app runs without API keys or a backend. Open `/` or `/fa-ir` through the Vite server. The production `dist/` folder can be hosted by a static host with a single-page app fallback to `index.html`.

## Scope

The original page blocked direct browser access. The layout is based on publicly available screenshots and the Persian page's indexed content, so this is a functional recreation rather than a verified pixel-perfect clone. The reference uses the MuscleWiki trademark; this independent demo is not affiliated with MuscleWiki.

This demo has 31 exercise entries. Exercise detail cards link to the original exercise library; videos, paid services, original authentication, and the full original exercise database are not reproduced. Unsupported equipment selections show an honest empty state. Saved exercises remain only in this browser's local storage. The timer and saved-exercise list are local demo functionality.

## Source layout

- `src/main.jsx`: React UI and interactions
- `src/style.css`: responsive layout and visual styling
- `src/data.js`: Persian muscle labels, equipment, sample exercise data
- `src/assets/`: local SVG anatomy diagrams

## Attribution

Anatomy SVG assets: [Surya Mouly / muscle_mapper](https://github.com/suryamolly/muscle_mapper), MIT licensed. The original copyright notice is in `ASSET-LICENSE`.



Icons: Lucide. Font: Vazirmatn, served through Google Fonts with local system fallbacks.

## Interface improvements

Common equipment is shown first, with expandable additional equipment. Selecting a muscle keeps the map visible and lists matching exercises in the adjacent panel. Mobile screens use front/back controls for a larger single-body view and initially collapsed equipment filters. Persian labels have larger type and stronger contrast; muscle group highlights and pointer labels help selection.

## PWA installation and offline support

Run `npm run build` and `npm run preview -- --port 5173`. Use the **نصب برنامه** button for a supported browser's install prompt or Persian installation instructions. Mobile installation requires a deployed HTTPS URL; localhost works for testing on this computer. External videos/links require internet. The app shell, SVG maps, sample exercises and timer are cached after the first successful visit; saved workouts use this browser's local storage. Google Fonts may fall back to system fonts offline.

The production build generates `dist/sw.js` with a content-versioned cache of all local output files. Updates activate once all existing app tabs/windows close, so active timers are not interrupted. `node scripts/check-pwa.mjs` verifies manifest icon dimensions, offline routes/assets and scoped cache cleanup.

Service-worker registration is disabled in development. Use `npm run dev -- --port 5174` on a separate origin when editing, so the production preview's service worker does not serve cached files over the Vite development server. To deploy, publish all of `dist/` at the site root with HTTPS and an index.html fallback; serve sw.js without long-lived caching. Native installation itself was not performed by the agent.

## HTTPS installation on your device

This project is configured for Sites hosting with a trusted HTTPS certificate. Open the deployed address in your device’s main browser and sign in with the owning account if prompted. On Android, use Chrome’s Install app option or the app’s install button. On iPhone/iPad, open in Safari and choose Share → Add to Home Screen. The local 127.0.0.1 preview address refers to the device itself and is not the deployed app address.

The hosting identity and static output directory are recorded in `.openai/hosting.json`. Publish the full production build, including the manifest, icons, and generated service worker, when updating the app.
