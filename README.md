# MuscleWiki — React recreation

A responsive recreation of the MuscleWiki muscle-map interface, built with React 19 and Vite. Full right-to-left layout with a right-side navigation rail, mirrored header and workspace, Persian controls, front/back body diagrams, male/female models, keyboard-selectable muscles, combined search filters, exercise guides, local saved exercises, workout sessions, progress charts, educational articles, and a rest timer.

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

This demo has 31 exercise entries with short Persian instructions and general difficulty labels. Details include source links to NASM or ACE and four NASM video demonstrations loaded from YouTube only after the user chooses to play them. Where a source covers a different equipment variant, the guide notes that difference; some source links are category libraries. This does not reproduce the original site's full database, authentication, or paid services. Unsupported equipment selections show an empty state. Saved exercises and workout history remain in this browser's local storage.

## Source layout

- `src/main.jsx`: React UI and interactions
- `src/style.css`: responsive layout and visual styling
- `src/data.js`: Persian muscle labels, equipment, sample exercise data
- `src/assets/`: local SVG anatomy diagrams

## Attribution

 MIT licensed. The original copyright notice is in `ASSET-LICENSE`.



Icons: Lucide. Font: Vazirmatn, served through Google Fonts with local system fallbacks.

## Interface improvements

Common equipment is shown first, with expandable additional equipment. Selecting a muscle keeps the map visible and lists matching exercises in the adjacent panel. Mobile screens use front/back controls for a larger single-body view and initially collapsed equipment filters. Persian labels have larger type and stronger contrast; muscle group highlights and pointer labels help selection.

## PWA installation and offline support

Run `npm run build` and `npm run preview -- --port 5173`. Use the **نصب برنامه** button for a supported browser's install prompt or Persian installation instructions. Mobile installation requires a deployed HTTPS URL; localhost works for testing on this computer. External videos/links require internet. The app shell, SVG maps, sample exercises and timer are cached after the first successful visit; saved workouts use this browser's local storage. Google Fonts may fall back to system fonts offline.

The production build generates `dist/sw.js` with a content-versioned cache of all local output files. Updates activate once all existing app tabs/windows close, so active timers are not interrupted. `node scripts/check-pwa.mjs` verifies manifest icon dimensions, offline routes/assets and scoped cache cleanup.

Service-worker registration is disabled in development. Use `npm run dev -- --port 5174` on a separate origin when editing, so the production preview's service worker does not serve cached files over the Vite development server. To deploy, publish all of `dist/` at the site root with HTTPS and an index.html fallback; serve sw.js without long-lived caching. Native installation itself was not performed by the agent.

## HTTPS installation on your device

The project has a Sites hosting configuration but has not been published. Device installation requires publishing the production build to a trusted HTTPS host. On Android, open that hosted address in Chrome and use Install app or the app’s install button. On iPhone/iPad, open in Safari and choose Share → Add to Home Screen. A local 127.0.0.1 preview address refers to the device itself and is not a deployed app address.

The hosting identity and static output directory are recorded in `.openai/hosting.json`. Publish the full production build, including the manifest, icons, and generated service worker, when updating the app.

## Local HTTPS frontend

Run `npm run dev:https` for development at `https://localhost:5176`. For the production PWA, run `npm run build` followed by `npm run preview:https`, then open `https://localhost:5170`. Development and preview use different ports to avoid cached production files interfering with development. For an HTTP development preview, run `npm start -- --port 5183 --strictPort`.

These commands generate a self-signed localhost certificate using OpenSSL, without changing system/browser trust. The certificate covers `localhost`, `127.0.0.1`, and `::1`, lasts 90 days, and is reused until near expiry. Private keys stay in the ignored `.certs/` folder. Never upload or share `.certs/localhost-key.pem`; regenerate certificates on each machine.

Browsers must trust the local certificate for warning-free HTTPS and service workers. On macOS, you can import **only** `.certs/localhost.pem` into your login Keychain and explicitly trust that localhost certificate for SSL. This is a manual trust decision; the setup script does not make it. Replacing an expired certificate requires trusting its replacement. Do not bypass certificate warnings as a substitute for trust.

This server listens only on this computer. It does not create a publicly trusted website or a phone-accessible URL. Device installation still needs trusted HTTPS hosting, or a separately configured LAN certificate trusted by that device.

## Page transitions

Section navigation uses Loading UI’s Orbit Ring, adapted to plain CSS and the app’s blue theme. Transitions last 450ms; repeated navigation cancels the previous destination, and search keystrokes do not restart the transition. The main content is marked busy and inert while switching; the menu remains available. Reduced-motion preferences skip the animation and delay. Attribution is in `LOADING-UI-LICENSE`.

## Workout sessions

Save exercises, open **برنامه من**, then choose **شروع جلسه**. Each session keeps a snapshot of your plan in saved order. Record reps (or seconds for plank exercises) and kilograms; zero represents no added weight. Each set starts the rest timer automatically, with pause/resume, skip, configurable duration, a completion beep and visible status. Rest periods use deadlines so switching pages or backgrounding the tab does not lengthen the countdown. A browser may suspend audio while backgrounded; the visible status and correct remaining time return when the app is active.

An active session and up to 100 completed session records are stored in this browser under `mw-workouts-v1`. After reload, use **ادامه جلسه** to resume. Finish to save a summary under **جلسه‌های قبلی** in your plan. Unlogged exercises are not counted as completed, and empty sessions do not create records. Data remains local to this browser and origin; no account or cloud sync is used. Clearing browser data removes it.

`src/WorkoutSession.jsx` contains the session interface; `src/useWorkout.js` manages local persistence and rest timing; `src/workout-model.js` handles session records and validation. `src/Timer.jsx` shares the existing flip clock and sound between standalone and session timers. Run `node scripts/check-workout.mjs` to verify snapshots, validation, timing, persistence and summaries.

## Progress charts

Open **پیشرفت من** in the menu or use **مشاهده پیشرفت من** from your saved plan. Activity totals and daily set counts cover the last 7 or 28 calendar days in the device’s local timezone, including zero-activity days. Active sessions and empty sessions are excluded; completed sessions are assigned to their start date.

The exercise selector shows only exercises with logged sets. The history chart displays the maximum recorded weight, reps, or duration per completed session, in chronological order across all locally retained sessions. Maximum weight and maximum reps may come from different sets; these are separate recorded metrics, not an estimated strength score. Bodyweight zero remains a valid value, and plank duration is shown in seconds. Chart points support keyboard selection, and expandable tables expose all plotted values. No sample data is added to user history.

`src/progress-model.js` handles aggregation and `src/WorkoutProgress.jsx` renders the charts without external chart dependencies. Run `TZ=Asia/Tehran node scripts/check-progress.mjs` to verify local-day boundaries, filtering, zero days, multiple sessions, and exercise metrics.

## Themes and exercise library

The app follows the device's light/dark preference on first visit. The app-bar sun/moon button saves an explicit choice under `mw-theme`, with cross-tab updates and an early theme bootstrap to avoid a light flash. Both themes cover maps, menus, dialogs, timers, articles, sessions, and charts.

The exercise library combines text, muscle, equipment, and difficulty filters. Search accepts Persian or English exercise/muscle names and normalizes Arabic/Persian letter variants, diacritics, and spacing. Equipment checkboxes support multiple types; the library's select shows that state. Clearing filters restores all 31 exercises. The detail guide is also available from the current exercise in a workout session.

`src/exercise-guides.js` contains guide metadata; `src/search-model.js` handles search and saved-list validation. Run `node scripts/check-library.mjs` to verify combined filters, Persian normalization, saved order/recovery, guide coverage, and source/video metadata. Demonstration playback requires internet and a browser/network that permits YouTube; each video includes a direct viewing link. General difficulty labels describe movement complexity, not a personalized assessment.

## Nutrition and injury articles

**تغذیه** contains three short articles on food variety, energy/protein, and hydration. **آسیب ورزشی** contains three general articles on sprains/strains, return to activity, and warm-up, plus urgent warning signs. A separate dumbbell section adds five cards covering shoulder/rotator cuff pain, elbow tendon pain, wrist injuries, lower-back pain, and safer strength training. These conditions are not exclusive to dumbbells. Expandable tips and direct WHO/NHS/AAOS source links are included. General sources were checked on 5 October 2026; dumbbell sources were checked on 6 October 2026. The content is general education and has not been clinically reviewed; it does not provide diagnosis or a personal treatment or nutrition plan.

## Accessibility and responsive checks

A skip link leads to the main content. Mobile menus keep background controls inert, trap focus, close with Escape, and restore focus to the trigger. Dialogs have accessible titles and scroll within short screens. Key controls have 44px touch targets, and filter/result updates are announced. Layouts were checked down to a 320px viewport; the app retains its existing reduced-motion page transitions.
