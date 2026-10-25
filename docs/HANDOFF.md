# Aurex Website Handoff

**Verified snapshot:** 2026-10-25. This document was assembled from the checked-out repository, its Git history, source files, and read-only Vercel project/deployment responses. It distinguishes source-confirmed facts from account/runtime facts. `UNKNOWN` means the checked sources did not establish the fact. Secret values are intentionally omitted; environment variables are named only.

## A. Identity

- **Project:** Aurex Discord Bots; Vercel project: `aurex-control`; dashboard product name: Aurex Control.
- **Purpose:** Public marketing site and a Discord-authenticated dashboard for six focused Discord bots: Music, Security, Greet, Ping, Ticket, and Level.
- **Audience:** Discord community/server owners and staff who select bots and configure them for servers. This is inferred from the site's copy and dashboard permission model.
- **Production URL:** [https://aurex-control.vercel.app](https://aurex-control.vercel.app). It is listed in the Vercel project/domain inventory and project documentation. The separate project-domain detail request returned HTTP 403, so exact alias assignment/verification status could not be rechecked.
- **Current preview URL:** [https://aurex-control-git-preview-redesign-adityarajx11.vercel.app](https://aurex-control-git-preview-redesign-adityarajx11.vercel.app). Vercel reported the stable alias attached to a `READY` preview deployment from commit `18e257d527dba6fde8fbfcea48d80950ffeae440` (`Add verified Aurex handoff pack`) at 22:50 on 2026-10-25. Its unique deployment URL was [https://aurex-control-kjghmkm6s-adityarajx11.vercel.app](https://aurex-control-kjghmkm6s-adityarajx11.vercel.app). A final documentation-metadata follow-up was made after that status check; the deployment status for that follow-up is UNKNOWN in this document. The page source remains from site commit `873f0a9`.
- **GitHub repository:** [https://github.com/Adityarajx11/dominyx-discord-bots](https://github.com/Adityarajx11/dominyx-discord-bots). Vercel deployment metadata confirms repository `dominyx-discord-bots` under `Adityarajx11`; this resolves the earlier misspelling `dominyx-disocrd-bots` in one prompt. Remote URL from the repository is the authoritative source.
- **Branches observed:** `main` (production/default branch), `preview-redesign` (active work branch; latest site-code commit before this handoff `873f0a9`; handoff documentation is committed on the branch), and `fix-gallery-and-text` (earlier reviews work; `67bc515`). At inspection, `main` was at `f86c456` and `fix-gallery-and-text` at `67bc515`. Do not merge `preview-redesign` unless explicitly asked.
- **Production deployment observed:** Vercel's latest listed `production` deployment was `READY`, from `main` commit `f86c456a484284beca772c44080580ac423c7705` (`Add scroll-driven reviews gallery`). This is older than the current redesign preview.
- **Vercel:** Project name `aurex-control`, project ID `prj_SPLb5JWGbEfNid87Zt9kzrryLO4b`; account scope ID `team_Ink2OOEn56YywQXwZQvlZqb3`. Human-readable team name: **UNKNOWN** (the linked team-context response contained no team records). Project metadata lists `aurex-control.vercel.app`, `aurex-control-adityarajx11.vercel.app`, and `aurex-control-git-main-adityarajx11.vercel.app`; the current branch alias is above. The latest observed READY branch deployment was commit `18e257d` at the timestamp above. Domain-detail endpoint access was denied with 403; do not infer domain verification from that failure.
- **Framework/architecture:** Static HTML/CSS/vanilla JavaScript frontend; Node.js HTTP server for local serving and API handling; Vercel Node serverless adapter; a React/React DOM component for the reviews gallery, bundled by esbuild. This is not a conventional Next/Vite/React application.
- **Node/package manager:** `package.json` engine is Node `>=20`; Vercel project setting reported Node `24.x`; inspected environment reported Node `22.13.0` and npm `10.9.2`. npm is the package manager (`package-lock.json`, lockfile v3).
- **Commands (from `package.json` and setup docs):**
  - Install: `npm install`
  - Local development: `npm run dev` (runs `node server.mjs`)
  - Start: `npm start` (also runs `node server.mjs`; default local port 3000)
  - Tests: `npm test` (`node --test test/*.test.mjs`)
  - Reviews bundle: `npm run build:reviews-gallery` (esbuild; overwrites `public/reviews-gallery.js`)
  - Vercel deploy: Git integration automatically creates previews and production deployments for linked branches; `scripts/deploy.ps1` documents `vercel deploy --prod --yes` plus an HTTP health check. This handoff task did not run a build or deploy command. There is no `npm run build` script.

## B. File tree

This is the tracked project tree at the pre-documentation snapshot, plus the two requested handoff files. `node_modules`, `.git`, ignored local settings, and other untracked/generated workspace files are not included.

- `.env.example` — names of supported local configuration variables; values are not reproduced here.
- `.gitignore` — excludes local and generated files from Git.
- `README.md` — project overview, setup, routes, backend, and security notes.
- `TODO.md` — historic delivery/acceptance checklist; some entries are stale.
- `api/` — Vercel API adapter folder.
- `api/index.mjs` — re-exports the backend handler for serverless use.
- `app.config.ts` — app metadata; currently points at a Discord Simple Icons logo URL.
- `docs/` — operational and project documentation.
- `docs/DASHBOARD_SETUP.md` — Discord OAuth, environment, database, and dashboard hosting setup.
- `docs/DESIGN_TOKENS.json` — machine-readable design-token and source-color inventory created in this handoff.
- `docs/HANDOFF.md` — this verified project continuation guide.
- `docs/MASTER_SESSION_SUMMARY.md` — historical project summary; branch, repository, typography, and validation claims are stale in places.
- `docs/README.md` — documentation index.
- `docs/SETUP_GUIDE.md` — broader bot setup guide; parts refer to a different/older bot project and absent scripts.
- `lib/` — backend integrations and domain helpers.
- `lib/db.js` — PostgreSQL pool, schema initialization, and query helpers.
- `lib/discord.js` — Discord API/OAuth/user and bot requests.
- `lib/env.js` — environment-variable access and aliases.
- `lib/invites.js` — Discord bot invite URL and permissions builder.
- `lib/schema.js` — settings schemas and SQL table definitions.
- `lib/security.js` — origin/CSRF checks, in-memory rate limiting, and audit helper.
- `lib/session.js` — encrypted cookie/session, CSRF, and cookie parsing helpers.
- `lib/settings.js` — settings validation, defaults, and database reads/writes.
- `manus-routes.json` — root-level route/title metadata.
- `package-lock.json` — exact npm dependency resolution (lockfile v3).
- `package.json` — npm scripts, dependencies, module type, and Node engine requirement.
- `public/` — static marketing site and dashboard resources.
- `public/config.js` — public-side configuration defaults; source review found no current consumer in the active landing-page script.
- `public/dashboard.css` — dashboard design and responsive layout.
- `public/dashboard.html` — dashboard loading/authenticated shell markup.
- `public/dashboard.js` — dashboard state, API calls, module controls, and settings UI.
- `public/index.html` — landing page, navigation, section markup, and external resource tags.
- `public/main.js` — landing-page interactions, module story, page rail, product demo, auth CTA state, and background-video playback.
- `public/manus-routes.json` — public copy of route/title metadata.
- `public/reviews-gallery.js` — compiled/minified React gallery runtime loaded by the homepage; generated bundle.
- `public/reviews.json` — separate sample review data file; source review did not establish a consumer in the current page.
- `public/styles.css` — landing-page tokens, sections, responsive rules, and animations; contains accumulated/overlapping historical CSS declarations.
- `public/assets/` — local imagery and background-video assets.
- `public/assets/aurex-fluid-bg.mp4` — MP4 background video source.
- `public/assets/aurex-fluid-bg.webm` — WebM background video source.
- `public/assets/aurex-fluid-poster.jpg` — background-video poster, 500×500.
- `public/assets/aurex-logo.jpg` — 1024×1024 JPEG; no explicit current source reference found; use: UNKNOWN.
- `public/assets/aurex-mark-white.png` — 64×64 brand mark used in the landing-page header and footer.
- `public/assets/bg-poster.jpg` — 1920×1080 JPEG referenced as a CSS fallback background.
- `public/assets/shot-1.png` — 1395×785 PNG; no explicit current source reference found; use: UNKNOWN.
- `public/assets/shot-2.png` — 1395×783 PNG; no explicit current source reference found; use: UNKNOWN.
- `public/assets/shot-3.png` — 1395×789 PNG; no explicit current source reference found; use: UNKNOWN.
- `scripts/` — deployment helper scripts.
- `scripts/deploy.ps1` — PowerShell Vercel production deploy and health-check helper; its `Project` parameter is declared but not used in the deploy command.
- `server.mjs` — local Node server, API routes, and serverless handler.
- `src/` — React gallery source and mount entry.
- `src/components/` — React component source folder.
- `src/components/ReviewsGallery.tsx` — supplied React scroll-driven review gallery; includes hardcoded sample review data.
- `src/mount-reviews-gallery.tsx` — mounts the component into `#reviews-gallery-root` with `headingClassName="hero-title"` and transparent background.
- `test/` — automated tests and manual/live diagnostics.
- `test/api.test.mjs` — API tests using in-memory Postgres and mocked Discord requests.
- `test/bot-map-check.mjs` — live bot/invite diagnostic; requires configured services.
- `test/dashboard.test.mjs` — dashboard markup and source behavior tests.
- `test/guild-probe.mjs` — live guild/module probe; can contact a configured host.
- `test/live-db-check.mjs` — live database/schema/settings diagnostic; may read/write data.
- `test/save-all-modules.mjs` — live settings write/read diagnostic; potentially side-effecting.
- `test/session-probe.mjs` — session-cookie/API diagnostic.
- `test/settings.test.mjs` — settings/schema tests using an in-memory database.
- `test/toggle-check.mjs` — live toggle write/restore diagnostic; potentially side-effecting.
- `vercel.json` — Vercel build/runtime and route configuration.

## C. Design system

### Colors

| Token/value | Use observed in source |
|---|---|
| `#050505` | Site and dashboard base background; navigation/logo/button contrast; dark canvas. |
| `#0B0D12` | Surface/panel and dark glass cards; navigation/menu surfaces. |
| `#F4F4F0` | Primary text, light buttons, high-contrast borders/icons. |
| `#8A8F98` | Muted body text and secondary copy. |
| `#5CE1E6` | Primary cyan signal: active nav, focus, progress, selected controls, and most accents. |
| `#c8c8c8` | Muted-strong secondary token in the early root palette. |
| `rgba(255,255,255,.16)` / `.34` | Default and bright hairline borders. |
| `rgba(16,16,16,.72)` / `rgba(255,255,255,.08)` | Glass and soft-glass surfaces. |
| `#78F4FF` | Strong cyan-blue override in review/headline accent CSS; differs from the requested canonical `#5CE1E6`. |
| `#7C8CFF` | Reviews-gallery orb/periwinkle glow. |
| `#F3F4F8`, `#D9DCEA`, `#CFD5FF`, `#9AA0B4` | Gallery card foreground, review text, orb and muted metadata. |
| `#E5484D`, `#FF6B6B`, `#FF9A9A`, `#FFB27A` | Comparison-cross and dashboard/error/warning states. |
| `#A78BFA`, `#8B5CF6`, `#A56DFF` | Ticket accent and legacy violet/component declarations. |
| `#FFB547`, `#D4A24C`, `#E9BD60`, `#F0B36A` | Ping/bento amber and historic component variants. |
| `#5CF2A0`, `#2FB87A`, `#61C89A`, `#65E2B6`, `#92FFD0`, `#9DFFD0` | Greet/mint and legacy green states. |
| `#FF7AC6`, `#E889B8`, `#FF7C9A` | Level/pink and historic component variants. |
| `#6FA8FF`, `#5D85FF`, `#5EE7FF`, `#5ED8FF`, `#4AA3FF`, `#3B82F6`, `#4D77FF`, `#8F8CFF` | Older blue/violet card accent declarations still present in the stylesheet. |

**Current six bot accents (set inline in active markup/story):** Music `#5CE1E6`; Security `#FF6B6B`; Greet `#5CF2A0`; Ping `#FFB547`; Ticket `#A78BFA`; Level `#FF7AC6`. The comparison/bento tiles use cyan, violet `#A78BFA`, amber `#FFB547`, and mint `#5CF2A0`. The stylesheet also contains lower-priority/historical palettes and many neutral/status hexes; `DESIGN_TOKENS.json` records every unique hex found per tracked CSS/component source file, without pretending each is an active semantic token.

### Fonts and assets

- **Space Grotesk**, Google Fonts, weights 400/500/600: display/headings and brand wordmark. Current main heading rule sets 600; some earlier declarations remain in the CSS cascade.
- **Instrument Serif**, Google Fonts, italic style: cyan italic headline emphasis/signature styling. It is requested at `ital@1` only in the landing-page Google Fonts URL.
- **Inter**, Google Fonts, weights 400/500/600/700: body, buttons, interface copy.
- **JetBrains Mono**, Google Fonts, weights 400/500/600: slash commands, counters, compact system labels.
- Google Fonts are remote; no local font files are tracked. Full request URLs are in `public/index.html` and `public/dashboard.html`.
- Font Awesome Free CSS `6.5.2` is loaded from cdnjs for bot/dashboard icons. Navigation/CTA also include inline Discord SVG. `app.config.ts` references Simple Icons via `https://cdn.simpleicons.org/discord/ffffff`.
- No pixel font is loaded by active HTML/CSS. `docs/MASTER_SESSION_SUMMARY.md` still mentions dot-matrix/pixel typography and should be treated as historical, not current guidance.

### Type scale, spacing, radii, shadows

- Type is fluid/clamp-based, not a single documented scale. Current final desktop hero: `clamp(42px, 7vw, 92px)`, weight 600, line-height 1.02, letter-spacing `-.055em`; at `max-width:720px`, `clamp(36px, 9vw, 64px)`; at `max-width:390px`, `clamp(34px, 9.2vw, 44px)`. Body hero copy: `clamp(14px, 1.55vw, 16px)` desktop and 14px mobile.
- Representative sections: general section headings `clamp(42px, 6.2vw, 79px)` in base rules; product-demo heading `clamp(36px, 5vw, 62px)`; module name `clamp(70px, 10vw, 132px)` with tablet/mobile overrides. The cascade has several later rules; check source order when changing these values.
- No centralized spacing scale exists. Layout uses `clamp()`, viewport units, and local pixel gaps/padding. Header height is 64px; desktop hero content max width is 1080px; product demo max width 1120px; founder column is designed as narrow/centered (max-width 640px per section rules); dashboard max width 1400px.
- Common control dimensions: primary hero buttons 46px high desktop/44px mobile; Discord nav button 38px desktop and 36px at <=720px; logo 32px. Gallery cards are 250×146px desktop and 176×122px at <=640px.
- Radii are component-specific: pill controls `999px`; gallery cards `16px`; demo step labels/cards mostly `8px`; dashboard fields/panels mostly 5–10px. There is no single global radius token.
- Primary nav shadow token: `0 4px 14px rgba(0,0,0,.16)`. Glass cards use translucent fills/backdrop blur and local cyan/accent glows. Hover transitions commonly use `0.2s`–`0.3s`; there is no unified shadow scale.

### Breakpoints and motion

- Landing stylesheet has repeated max-width breakpoints at 1100, 900, 860, 850, 767, 760, 720, 600, 420, 390, and 360px; it also uses min-width combinations around 721/768px. Dashboard: 800px and 480px. Reviews component: 640px. The effective cascade should be checked in source order because the landing stylesheet contains old and new rule blocks.
- Module story: section is pinned on desktop/tablet widths >=768px when reduced motion is not requested; `gsap.registerPlugin(ScrollTrigger)`, `scrub:0.6`, snap to six positions with `duration:0.5`, `delay:0.04`, `power1.inOut`; step fades/slides use `power1.in` / `power2.out`. On <=767px it becomes a stacked scroll-reveal and IntersectionObserver updates the counter/dot state. If GSAP is unavailable, panels are stacked and visible.
- **Lenis:** no Lenis import, dependency, or runtime reference exists. There is therefore no Lenis/ScrollTrigger sync code to copy. Actual sync setup is `gsap.registerPlugin(ScrollTrigger)` before creating the module timeline; native window scroll drives ScrollTrigger. Gallery uses its own requestAnimationFrame progress interpolation, not Lenis.
- Hero words reveal with 60ms stagger, `.44s`, `cubic-bezier(.2,.8,.2,1)`; reduced motion disables this animation and shows words.
- Product demo runs an 18-second looping GSAP timeline, split into four steps; it pauses when outside view, hovered, touched, focused, or the document is hidden, and has a Replay button. `prefers-reduced-motion: reduce` displays the final configured/music-playing state without autoplay.
- Gallery currently lerps progress by `0.1` per animation frame (unless reduced motion, then 1); card duration constant `.36`; center text and words use transform/opacity/filter. Important spec differences are logged in section K.
- CSS/JS has reduced-motion branches for hero, module story, product demo, reveals and decorative motion. Dashboard CSS does not show a reduced-motion override for its loading shimmer; audit before adding any dashboard motion.

## D. Libraries

### npm packages (manifest range → lockfile version)

- `dotenv` `^18.0.8` → `18.0.8`: loaded by `server.mjs` for local `.env` support; hosting injects process environment.
- `pg` `^8.13.0` → `8.23.1`: PostgreSQL pool and queries in `lib/db.js`.
- `esbuild` `^0.28.2` → `0.28.2` (dev dependency): bundles the TSX review mount/component into `public/reviews-gallery.js`.
- `pg-mem` `^3.0.14` → `3.0.14` (dev dependency): in-memory Postgres test support.
- `react` `^19.3.1` → `19.3.1` (dev dependency): gallery component runtime.
- `react-dom` `^19.3.1` → `19.3.1` (dev dependency): `createRoot` mount into the static homepage.

Those are the six direct manifest packages. Transitive packages are pinned in `package-lock.json`; use `npm ls --all` if a full transitive inventory is needed. No package named Lenis is installed.

### External browser libraries

- GSAP `3.12.5` CDN plus ScrollTrigger `3.12.5` CDN, loaded deferred by `public/index.html`; registered in `public/main.js` before the module story timeline.
- Font Awesome `6.5.2` stylesheet via cdnjs, with SRI on the landing page; dashboard uses the same CDN but does not include an `integrity` attribute.
- Google Fonts as described in section C.
- No jQuery, Lenis, or general frontend framework is referenced in active HTML.

### Exact GSAP/ScrollTrigger wiring

`public/index.html` loads the two pinned CDN scripts, then deferred `/main.js`; `public/main.js` registers `ScrollTrigger` and creates one desktop story timeline with a scroll-trigger configuration equivalent to:

```js
gsap.registerPlugin(ScrollTrigger);
const storyTimeline = gsap.timeline({
  scrollTrigger: {
    id: 'aurex-module-story',
    trigger: story,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.6,
    invalidateOnRefresh: true,
    snap: {
      snapTo: 1 / (panels.length - 1),
      duration: 0.5,
      delay: 0.04,
      ease: 'power1.inOut'
    },
    onUpdate: (self) => {
      // derive active panel/progress and interpolate --stage-accent
    }
  }
});
```

There is no Lenis/GSAP synchronization snippet in this repository; do not add one without choosing and installing Lenis intentionally. The gallery's independent progress loop is in `src/components/ReviewsGallery.tsx` lines 73–160.

## E. Page map

Actual source order is the authority. The current order is Hero → Modules Story → Reviews → Founder Note → Product Demo → Comparison → Bento Stats → Bot Suite → Why Aurex → CTA → Footer. An earlier high-level requirement listed Why Aurex ahead of walkthrough; the later section-by-section requests/source place it after the Suite. Confirm intended ordering before moving sections.

| Order / id | Purpose, exact content and links | Animation and mobile behavior | Status |
|---|---|---|---|
| Header / `site-header` | Brand “AUREX”; links “Home” → `#top`, “Bots” → `#modules`, “Why Aurex” → `#why-story`, “Connect” → `#connect`; button “Login with Discord” → `/dashboard.html`. | Sticky/blurred, 64px desktop. At <=720px desktop nav hides, auth button remains visible alongside hamburger; menu has same links and login action. Active section underline. | Done in source; responsive 390/768 was checked in prior audit. |
| Hero / `#top` | Pill “Built for servers with real people in them.” Heading “Six bots. Each built to do one thing exceptionally.” Body “Music, security, welcomes, alerts, tickets and levels. Add only what your server needs, and run it all from one dashboard.” Buttons “Explore the bots” → `#modules`; “Open dashboard” → `/dashboard.html`. Chips: Music, Security, Greet, Ping, Ticket, Level. | Centered. Headline words rise/fade with 60ms stagger. Mobile uses smaller clamp sizes and wrap; reduced motion shows final state. Fixed dark fluid video behind all sections with top/global shade layers. | Done in source; visual layout previously checked at 390/768. |
| Modules Story / `#modules` | Label “THE AUREX SUITE”; heading “Six bots. Zero clutter.” Six panels (exact entries below); note “SCROLL TO EXPLORE”; counter `01`–`06` of `/ 06`; clickable accessible dots for each bot. | Desktop >=768px pinned GSAP/ScrollTrigger, about six scroll steps, scrub `.6`, snap `.5s`; panel slides/fades, word and command reveal, reply fade, counter/progress and bot accent interpolate. Mobile <=767px stacks modules and reveals each on scroll; dots/counter follow IntersectionObserver. | Done in source; correct six names. 390/768 checked previously. |
| Reviews / `#reviews-gallery` | Accessible section label “Server reviews”; heading “What servers say about Aurex”; each card shows initial, `Sample / {name}`, server, stars, quote, and bot chip; side label “Reviews”, counter `(0)` through percentage, hint “Scroll to start”. All 14 sample cards are listed below. | User-supplied React component. Wrapper `560vh` (not 500vh), sticky `100svh`, perspective `1000px`, cards move in mirrored arcs; RAF smooths at `.1`. Desktop cards 250×146, <=640px 176×122 and stars hidden. Current source still renders all 14 sample cards on mobile. Reduced motion disables blur/easing but remains a scroll-driven card choreography, not a static list. | Partly done: visual/gallery works in source, but data are explicitly sample and several original mechanical requirements differ (section K). |
| Founder Note / `#founder-note` | Label “WHY I BUILT THIS”; heading “I wanted one setup that just worked.” Copy: “I started building Discord bots because the ones my server relied on were never quite right. One played music well and handled moderation badly. Another had a hundred commands and no clear dashboard.” / “I kept stitching them together, and every fix broke something else. So I stopped patching and started building: one bot for each job, each tuned until it felt effortless, all controlled from one calm dashboard.” / “Aurex is the setup I always wanted for my own community. If it makes yours feel a little more alive, it did its job.” Source signature: “— Lucifer, founder of Aurex”. | Centered narrow column, left cyan rule draws and paragraphs reveal as they enter. Mobile uses 22px side padding, title 36–48px, paragraphs 17px with 1.72 line-height. | Source complete; signature conflicts with latest wording instruction (“Obsidian”), see K. |
| Product Demo / `#see-it-work` | Label “THE CONTROL PANEL”; heading “From invite to in tune in four steps.” Subline “Watch Aurex go from one click to a running bot.” Steps: “01 Add”, “02 Authorize”, “03 Configure”, “04 Use”. Simulated server list: “Aurex Community”, “Support Hub”. Mock channel “#listening-room”; reply “Now playing · Midnight City”. Buttons/controls “Add Music to server”, “Authorize”, “Select a role”, “@DJ”, “@Moderator”, “Auto-leave when empty”, “Replay”. | HTML/CSS simulation (no screenshots/video). GSAP 18s loop: add, authorize, configure role/volume/switch, type `/play midnight mix`, show reply/progress/equalizer. Pauses offscreen, hover, touch, focus, or hidden document. Mobile stacks Discord panel below dashboard. Reduced motion shows final state. | Done in source. |
| Comparison / `.compare-section` (no id) | Label “AUREX VS ALL-IN-ONE BOTS”; heading “Specialists beat generalists.” Subline “Fewer moving parts. Fewer things that break.” Cards “Aurex” and “Typical all-in-one bot”. Rows: “Add only the bots you need”; “One bot, one clear job”; “Independent settings for every bot”. Aurex checks marked “Included”; other side crosses “Not included”. | Two cards side by side; mobile cards stack with aligned row layouts. Rows reveal on scroll; checkmarks draw and muted crosses fade. | Done in source; exact comparison requested (old table is rejected). |
| Bento Stats / `<footer class="stats-footer bento-grid">` (not an actual page footer) | `6` / “Specialist bots”; `1` / “Control console”; “Modular” / “Add or remove any bot as your server grows”; “Discord-native” / “Slash commands, no new app to learn”. | Four different-size glass tiles; count-up and small six-dot, mini-window, snap-block and typed-command visuals. Responsive grid/card behavior. | Done in source. |
| Bot Suite / `#bot-suite` | Label “THE AUREX SUITE”; heading “Choose your bots.”; subline “Each one is focused, fast and fully independent. Start with one, or build the whole suite.” Six exact cards below; each has “Add to server” link. | 3×2 desktop, 2×3 tablet and one column mobile as requested; accent-specific radial glass treatment, hover, fade-up with 80ms stagger. Initial markup href `#connect`; script fetches actual invite URLs from `/api/invites` when configured. | Done in source; actual invite availability/runtime configuration UNKNOWN. |
| Why Aurex / `#why-story` | Label “WHY AUREX”; heading “Built for communities that have outgrown one-size-fits-all.”; subline “Start with one bot. Add the rest when your server is ready. Everything stays yours to shape.” Cards: “01 Modular” / “Install exactly what your community needs today, and add the rest as it grows.”; “02 Responsive” / “Commands that answer quickly and never get in the way.”; “03 Human” / “Designed for the people behind the usernames, not just the commands.” Button “Build your stack” → `#bot-suite`. | Centered editorial heading and three large glass cards; 80ms stagger/reveal and hover glow; responsive stacking. | Done in source. |
| Final CTA / `#connect` | Label “READY WHEN YOU ARE”; heading “Your server, fully equipped.”; subline “Choose a bot, connect it to Discord and let Aurex take care of the rest.” Buttons “Choose your bots” → `#bot-suite`; “Login with Discord” → `/dashboard.html`. | Centered, orbit decoration, button actions; page-scroll rail has a `#connect` target and ends at final CTA. | Done in source; source map is present. |
| Footer / `.site-footer` | Aurex mark + “AUREX”; tagline “Discord bots, crafted by people who live on Discord.” Links “Home” → `#top`, “Bots” → `#bot-suite`, “Why Aurex” → `#why-story`, “Connect” → `#connect`; “© 2026 Aurex Systems”. | Responsive footer layout. | Done in source. |

### Module story and suite card copy (source exact)

| Bot | Module-story tagline | Demo command | Demo reply | Suite description | Command pills | Accent |
|---|---|---|---|---|---|---|
| Music | Every voice channel, perfectly in tune. | `/play midnight mix` | Now playing: Midnight City · 3 tracks queued | Studio-grade playback for every voice channel. Queues, playlists and DJ roles, handled. | `/play` `/skip` `/queue` | `#5CE1E6` |
| Security | Quiet protection. Complete control. | `/verify @newcomer` | Verified · 0 risks found · role granted | Automod, verification and audit trails that keep a server calm without slowing anyone down. | `/lock` `/verify` `/audit` | `#FF6B6B` |
| Greet | A first impression worth designing. | `/welcome preview` | Welcome card ready · @newcomer given Member | Welcome cards, auto-roles, farewells and DMs. A first impression, designed. | `/welcome` `/role` `/rules` | `#5CF2A0` |
| Ping | Your community knows the moment you go live. | `/alert test` | Live alert sent · role mentioned · checking every 2 min | YouTube live alerts with your own message, role mention and polling interval. | `/ping` `/alert` `/notify` | `#FFB547` |
| Ticket | Private support, handled properly. | `/ticket open billing` | Ticket #204 opened · your team has been notified | Private support threads with transcripts, so every request gets a proper answer. | `/ticket` `/close` `/transcript` | `#A78BFA` |
| Level | Turn every message into momentum. | `/rank @you` | Level 18 · 42% to level 19 · reward unlocked | XP, cooldowns, role rewards and level-up messages that make activity feel earned. | `/rank` `/leaderboard` `/xp` | `#FF7AC6` |

### Review card sample data currently embedded in the component

These are not verified endorsements. The component comment says “Replace these sample reviews with real ones.” The displayed name line literally prefixes each name with “Sample /”. Data are editable in the `DEFAULT_REVIEWS` array.

| Name | Server | Stars | Bot | Sample quote |
|---|---|---:|---|---|
| LunaByte | Night Shift | 5 | Music | The queue stays out of the way and our DJs can hand off control without breaking the vibe. |
| KaiRin | Orbit Lounge | 5 | Security | The audit trail makes it obvious what happened and who handled it. |
| Miko | Cloud Garden | 5 | Ticket | Private support threads feel much calmer now, and transcripts are easy to find. |
| Juno | After Hours | 5 | Greet | New members get the right role and a warm hello without three bots talking at once. |
| Rook | The Workshop | 4 | Level | The commands are focused, quick, and much easier to explain to new staff. |
| Nera | Pixel Harbor | 5 | Music | A clean queue and simple DJ controls were exactly what our voice channels needed. |
| Vex | Common Room | 5 | Security | Verification is clear for members and the mod logs are actually useful. |
| Sable | Maple Street | 4 | Ticket | Our helpers can keep conversations private without losing the history. |
| Dax | Low Orbit | 5 | Greet | The welcome flow feels intentional instead of like an automated wall of text. |
| Bryn | Signal Room | 5 | Level | The progression tools give our community something to return to every day. |
| Ines | Moss Light | 5 | Music | It feels like one dependable layer instead of a pile of unrelated bots. |
| Tomo | Arcade 404 | 4 | Security | The focused controls make routine moderation faster for the whole team. |
| Rhea | Blue Hour | 5 | Ticket | A ticket becomes a real conversation, not another noisy channel to babysit. |
| Ulric | Lantern Club | 5 | Greet | The first impression is smoother and the server stays focused on people. |

## F. Components

The landing page is authored primarily as custom semantic HTML in `public/index.html`, styled by `public/styles.css`, and wired by `public/main.js`. There is no page component framework for the marketing sections. The dashboard is similarly custom HTML/CSS/JS. The component inventory is:

- Site header/desktop navigation/mobile menu/Discord login CTA — custom HTML/CSS/JS in `public/index.html`, `public/styles.css`, `public/main.js`.
- Hero/trust pill/word reveal/chips — custom HTML/CSS/JS in the same files.
- Page-wide scroll rail and section dots — custom HTML/CSS/JS in the same files.
- Six-panel Module Story — custom HTML + GSAP/ScrollTrigger in the same files.
- `ReviewsGallery` — user-supplied React/TSX component in `src/components/ReviewsGallery.tsx`; mounted by `src/mount-reviews-gallery.tsx`; built bundle in `public/reviews-gallery.js`. The prior project prompt said to copy the attached component unchanged, but a later audit changed bot labels/heading spacing; motion code was intentionally preserved. Original source URL/21st.dev/Uiverse attribution: **UNKNOWN**; no such attribution/link appears in tracked source.
- Founder Note — custom HTML/CSS/JS in page files.
- Product Demo — custom-coded HTML/CSS/JS simulation; GSAP timeline in `public/main.js`; no screenshot, GIF, or video demo asset.
- Comparison cards and Bento Stats — custom HTML/CSS/JS in page files.
- Six Bot Suite cards — custom HTML/CSS/JS in page files.
- Why Aurex cards, final CTA, footer — custom HTML/CSS/JS in page files.
- Dashboard auth-loading and auth-gate views; Discord login — custom page in `public/dashboard.html`, `public/dashboard.css`, `public/dashboard.js`.
- Dashboard server rail, bot switcher, settings renderer/save form — custom HTML/JS with field schema returned by `/api/modules`; backend implementation in `server.mjs` and `lib/`.

No source evidence was found that any component is from 21st.dev or uiverse.io. Therefore component origin for those sites and source links are **UNKNOWN**, not guessed.

## G. Other pages and flows

### Dashboard and Discord OAuth

- Public links point to `/dashboard.html`. The dashboard has loading (`#auth-loading`), signed-out (`#auth-gate`), and authenticated (`#dashboard-shell`) states.
- Signed-out copy: “Run your server from one place.”; “Sign in with Discord to select a server and manage the Aurex modules you have permission to control.”; button “Login with Discord” → `/api/auth/login`; note “You will only see servers where you have Administrator or Manage Server permissions.”
- Authenticated view provides server selector, six-bot switcher, settings form and “Save changes”. Permission checks accept guild owner, Administrator, or Manage Server.
- Login requests Discord scopes `identify guilds`, uses OAuth state cookie, then callback creates an encrypted 8-hour `aurex_session` cookie. Session uses AES-256-GCM and stores a CSRF token; `/api/auth/me` returns a safe user projection and CSRF token. Token refresh is attempted near expiration.
- Dashboard requests `/api/auth/me` on load, then `/api/guilds`, `/api/modules`, and `/api/guilds/:id/settings`. Writes use PUT or PATCH with `{module, values}`, origin/CSRF checks, validation, and audit logging. Actual third-party config, live service status, and user-facing auth success are **UNKNOWN** from source inspection.
- **Security caveats from source:** a development-only hard-coded session-secret fallback exists if unset (OAuth readiness normally blocks login); logout is a GET route; rate limits are in-memory/per-process and not shared across Vercel instances. Review before production security expansion.

### Local/static routes and API endpoints

- Static routes: `/` → `public/index.html`; `/dashboard` and `/dashboard.html` → dashboard page; static assets from `public/`.
- API: `GET /api/health`; `GET /api/modules`; `GET /api/invites`; `GET /api/auth/login`; `GET /api/auth/callback`; `GET /api/auth/me`; `GET /api/auth/logout`; `GET /api/guilds`; `GET /api/guilds/:id/settings`; `PUT` or `PATCH /api/guilds/:id/settings`. The settings write rechecks user permissions, origin, CSRF, and schema; other API paths return JSON 404. Unsupported methods return 405.
- Local server uses `server.mjs`; `api/index.mjs` re-exports its handler. `vercel.json` routes `/api/(.*)` to `/server.mjs`, then filesystem, then `/public/$1` fallback.
- Dynamic invite URLs are built by `/api/invites` from bot application IDs. A live link for each bot is not statically knowable: **UNKNOWN** until service config is checked.

### Environment variables (names only; no values)

`.env.example` names: `CLIENT_ID`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_REDIRECT_URI`, `AUREX_PUBLIC_URL`, `AUREX_SESSION_SECRET`, `DATABASE_URL`, `BOT_TOKEN`, `BOT_TOKEN_MUSIC`, `BOT_TOKEN_LEVEL`, `BOT_TOKEN_GREET`, `BOT_TOKEN_TICKET`, `BOT_TOKEN_PING`, `BOT_TOKEN_GUARD`, `BOT_ID_MUSIC`, `BOT_ID_LEVEL`, `BOT_ID_GREET`, `BOT_ID_TICKET`, `BOT_ID_PING`, `BOT_ID_GUARD`, `PORT`, `NODE_ENV`, `PG_POOL_MAX`.

Code-supported alias: `PUBLIC_APP_URL` as fallback for public URL. `CLIENT_ID` is an OAuth client-ID fallback for `DISCORD_CLIENT_ID`. Vercel environment inventory listed these names, with production target only: `CLIENT_ID`, `DISCORD_REDIRECT_URI`, `AUREX_PUBLIC_URL`, `AUREX_SESSION_SECRET`, `PORT`, `PG_POOL_MAX`, `NODE_ENV`, `DISCORD_CLIENT_SECRET`, `DISCORD_CLIENT_ID`, `DATABASE_URL`, `BOT_TOKEN`, `BOT_TOKEN_MUSIC`, `BOT_TOKEN_SECURITY`, `BOT_TOKEN_GREET`, `BOT_TOKEN_PING`, `BOT_TOKEN_TICKET`, `BOT_TOKEN_LEVEL`, `BOT_ID_MUSIC`, `BOT_ID_SECURITY`, `BOT_ID_GREET`, `BOT_ID_PING`, `BOT_ID_TICKET`, `BOT_ID_LEVEL`. This lists names/targets only, not values.

`docs/SETUP_GUIDE.md` also names `LAVALINK_HOST`, `LAVALINK_PORT`, `LAVALINK_PASSWORD`, `LAVALINK_SECURE`, `YOUTUBE_API_KEY`, `YOUTUBE_POLL_MINUTES`, `LASTFM_API_KEY`, and `GUILD_ID` for a separate/older bot-service workflow; these are not in this app's `.env.example` and should not be assumed active here.

## H. Assets

### Tracked local media

- Background video: `public/assets/aurex-fluid-bg.webm` (1.920s), `public/assets/aurex-fluid-bg.mp4` (1.920s), referenced in that order by the video element.
- Background poster: `public/assets/aurex-fluid-poster.jpg` (500×500), referenced by the `<video poster>`.
- CSS fallback image: `public/assets/bg-poster.jpg` (1920×1080), referenced by `public/styles.css`.
- Brand mark used in header/footer: `public/assets/aurex-mark-white.png` (64×64).
- Present but no current source references found: `public/assets/aurex-logo.jpg` (1024×1024), `public/assets/shot-1.png` (1395×785), `public/assets/shot-2.png` (1395×783), `public/assets/shot-3.png` (1395×789). Usage: **UNKNOWN**.
- No local font files are tracked.

### Remote assets and icons

- Google Fonts: Space Grotesk, Instrument Serif, Inter, JetBrains Mono (URLs in both HTML heads).
- Font Awesome 6.5.2 CSS from cdnjs; individual brand/bot icons requested by CSS class.
- Inline Discord SVGs in the landing page header and CTA.
- Discord user avatar can be returned dynamically by API; dashboard source uses the returned avatar/profile data. Exact account image URLs are runtime data, not fixed assets.
- `app.config.ts` logo URL uses Simple Icons CDN. No local favicon file/link was found.

## I. SEO and meta

- Landing page: `<html lang="en">`; title `Aurex — Discord Bots That Run The Server`; description `Aurex gives Discord communities a sharper way to run music, security, welcomes, tickets, levels, and more.`; theme color `#050505`; responsive viewport meta.
- Dashboard: `<html lang="en">`; title `Aurex Control — Dashboard`; theme color `#050505`; responsive viewport meta. No description tag found in the dashboard head.
- No explicit `rel="icon"`, canonical URL, Open Graph, or Twitter-card metadata was found in either page head. Favicon behavior: **UNKNOWN** (no tracked favicon file/link).
- Route manifests declare `/` title `Aurex Discord Bots` and `/dashboard.html` title `Aurex Control Dashboard`, which differ slightly from browser document titles.
- Locale setup beyond `lang="en"`: **UNKNOWN**.

## J. Decision log

### Current visual/product decisions

- Final active direction is a premium near-black (`#050505`) product site with restrained cyan (`#5CE1E6`), Space Grotesk/Instrument Serif/Inter/JetBrains Mono, transparent Aurex mark, and a dark fluid video background. Pixel/arcade typography was removed from active site declarations.
- Desktop navigation is sticky at 64px; Discord login remains visible beside the hamburger at mobile widths. The scroll rail is desktop-only (<768px hidden) and maps through the final CTA.
- Module story is pinned/scroll-controlled on larger screens and stacked on mobile; bot names are the six real module names, not the early Music/Moderation/Welcome/Ticket/Levels/Logs draft.
- “See it in Discord” screenshot showcase was removed and replaced with the founder-note section; the walkthrough became an HTML/CSS/JS demo, not screenshots or video.
- Comparison is the specialist-vs-generalist two-card treatment; the former comparison table was rejected.
- Four stat tiles were replaced by the distinct-size bento tiles. The bot suite uses per-bot accents, copy, and slash-command pills.
- Reviews component is integrated into the static site through esbuild/React mounting; its editable array remains sample data and must not be represented as genuine testimonials.
- **Wording rules in the latest owner prompt:** keep the brand premium; never describe the site/product as “simple” or “cheap”; founder signature should be **“Obsidian”**. Existing page source still says “— Lucifer, founder of Aurex”; do not silently treat that as corrected.

### Explicitly rejected treatments

- Pixel fonts (including Pixelify Sans) and any pixel/arcade typography.
- The old comparison table.
- The old four flat/repetitive stat tiles.
- The “See it in Discord” screenshot/caption section.
- Generic stock imagery, placeholder/false claims, unlabeled sample testimonials, and merging `preview-redesign` into `main` without explicit approval.

### History/source-document caveats

- `docs/MASTER_SESSION_SUMMARY.md` is dated 2026-10-19, points at a different GitHub repository and `/home/ubuntu/aurex`, describes dot-matrix/pixel typography, and says clean `main`; those statements conflict with the current checkout and active branch. Do not use it as authority for current design or Git state.
- `docs/SETUP_GUIDE.md` includes external bot-service instructions, another repo reference, and commands not declared by the current `package.json`.
- `TODO.md` contains older/partly obsolete requirements (including a historic placeholder invite-map item); current invite links are generated by the API. Check active source before treating a TODO line as open work.

### Recent commit milestones on `preview-redesign` (chronological)

- `e322934` — create fluid preview redesign branch experience.
- `0760bbc` — refine sitewide type, navigation, and homepage hero.
- `9f5f696` — refine six-bot scroll story and page progress rail.
- `b9af40b` — replace showcase with founder note.
- `4f3631a` — replace walkthrough with animated control-panel demo.
- `61e4d8e` — rebuild comparison and bento stats section.
- `0cffc86` — keep bento proportions on tablet.
- `8532053` — refresh bot suite cards with accent-specific styles.
- `32ca883` — rebuild Why Aurex and closing CTA.
- `873f0a9` — audit site labels and remove stale placeholders.
- Documentation handoff commit: recorded in this branch's Git history; it contains only `docs/HANDOFF.md` and `docs/DESIGN_TOKENS.json`.

## K. Known bugs and open issues

### Confirmed source/spec mismatches

1. **Reviews are placeholders, not real testimonials.** Reproduce: open `#reviews-gallery`; every name is rendered as “Sample / …”. Quotes are hardcoded sample content, and the component comment explicitly requests replacement. No Ping-tagged review exists in the 14-entry sample array. Likely cause: supplied demo/default data was never replaced with approved customer reviews. Do not publish them as factual endorsements.
2. **Gallery implementation differs from the earlier exact spec.** Reproduce by inspecting `src/components/ReviewsGallery.tsx` and scrolling `#reviews-gallery`: wrapper is `560vh` rather than requested `500vh`; mobile displays all 14 cards rather than 7; cards move on mirrored arcs with `z` around ±350px rather than beginning at `-2000..-400px` and traveling `+2400px`; tilt is `rotateX(8deg)` and `rotateY` based on arc rather than requested ±6°/±18°; current counter begins `(0)`, not `(00)`; center heading fades out near 90% rather than staying always visible. Reduced-motion removes blur/easing but does not produce the requested static list. The original requested threshold fades are not implemented as described. Likely cause: gallery was rebuilt/refined and supplied component behavior retained rather than matching all details from the earlier task prompt.
3. **Founder signature conflict.** Reproduce at `#founder-note`: visible text is “— Lucifer, founder of Aurex”; latest owner wording requires “Obsidian”. Likely cause: the brand instruction arrived after the section had already been committed. Resolution requires editing source in a later authorized code task; this handoff did not change site code.
4. **Production vs preview drift.** Vercel reported the latest production deployment `READY` on `main` commit `f86c456`, whereas the redesign preview is `preview-redesign` commit `873f0a9`. This is expected under the no-merge instruction, but production does not yet contain the redesign/audit commits.
5. **CSS cascade debt.** `public/styles.css` contains repeated `:root`/component rules, multiple breakpoint passes, and legacy bot-accent maps alongside the current inline six-bot accents. Reproduce by searching `:root`, `.bot-card:nth-child`, and later override blocks. Likely cause: iterative section-by-section styling. Do not assume the first matching declaration is effective.
6. **Historical docs are inconsistent.** Reproduce by comparing `docs/MASTER_SESSION_SUMMARY.md` and `docs/SETUP_GUIDE.md` with `package.json`, current Git remote, current branch, and current page source. Likely cause: docs were not updated after repository/branch/design work.
7. **Security/runtime caveats:** `lib/session.js` has a development-only default session-secret fallback if unset; `/api/auth/logout` is GET; rate limiting is in-memory, not shared across serverless instances. These are source-level risks, not proof of a live exploit. Review hardening before scaling production use.
8. **Dashboard reduced motion:** `public/dashboard.css` contains an infinite 1.5s loading shimmer and no obvious reduced-motion media override. Reproduce with `prefers-reduced-motion: reduce` while dashboard loading is visible. Likely cause: reduced-motion additions focused on the public site.
9. **Assets/source provenance:** `aurex-logo.jpg` and `shot-1..3.png` are tracked but have no explicit current source references; provenance/use are UNKNOWN. No source link for the supplied React component is recorded.
10. **Vercel owner/domain details:** Vercel's project metadata supplied domains and account scope, but a domain-details API call returned 403 for scope `adityarajx11`; team display name and per-domain verification/redirect status are UNKNOWN.

### Runtime defects not confirmed

- Previous audit notes report the responsive homepage/dashboard check at 320, 390, and 768px passed for horizontal overflow and missing Login with Discord controls, and the site tests had passed 39/39 at that time. This handoff did not rerun tests or browser checks. No 1440px result is recorded.
- Current OAuth, database, bot invites, Discord permissions, production health endpoint, and actual dashboard save flow are **UNKNOWN** from source-only review.
- No new site-code change was made in this task, so no new layout defect was introduced by the handoff files.

## L. Prompt history

Chronological summary of owner prompts present in the inherited session/context. Outcomes describe repository/source results, not a claim that every finer detail of the original brief is currently satisfied.

1. **Initial reviews/typography/background request:** use existing repo/site, replace review grid with scroll-driven 3D Z-gallery, Pixelify Sans headline spacing, autoplay background video without controls; branch `fix-gallery-and-text`, test scroll positions, open unmerged PR. **Partly worked:** gallery work and branch history exist, but several gallery mechanics still diverge (K.2); later typography/background instructions superseded parts of this request. PR status is **UNKNOWN** from the source/deployment checks.
2. **Copy supplied `ReviewsGallery.tsx` unchanged and render it:** keep motion, use hero font class and transparent background. **Partly worked:** TSX is mounted with `hero-title` and transparent background; later audit changed bot-tag and heading-spacing presentation while leaving motion code. Original upstream component link is unknown.
3. **Create `preview-redesign`, convert fluid GIF to MP4/WebM, implement six-module pinned story, keep supplied reviews component, test tablet/phone, no merge.** **Partly worked then superseded:** redesign branch/video/story were created; the initial temporary 6-module names and typographic request were replaced by later explicit six-bot/colors/Space Grotesk requirements.
4. **“For every part use /frontend-design.”** **Worked as a design constraint:** subsequent sections followed the supplied frontend-design skill and requested visual system; no standalone site change resulted from this message alone.
5. **Edit global styles/nav/hero only:** remove pixel font; Space Grotesk/Instrument Serif/Inter/JetBrains Mono; 64px nav with persistent Discord action; centered hero and word reveal. **Worked in source:** current fonts/hero/nav are present and mobile Discord button is visible next to hamburger.
6. **Rebuild only Modules Story and add page-wide scroll line:** six real bots, per-bot accents/copy, desktop pin/scrub/snap, mobile stack, reduced motion. **Worked in source:** current six-module data, desktop ScrollTrigger, mobile stack, and rail exist. User's desired one accent word was preserved in headings.
7. **Replace “See it in Discord” screenshots with founder note.** **Worked in source:** founder note copy/scroll line is present; the later “Obsidian” signature instruction is not reflected yet.
8. **Replace “See how it works” with coded auto-playing control-panel demo.** **Worked in source:** custom HTML/CSS/JS, four-step timeline, pause/resume controls and reduced-motion still state exist.
9. **Rebuild “Focused by design” comparison and four stats.** **Worked in source:** two comparison cards, aligned rows/check/cross, and four varied bento tiles exist; old table/repetitive stat treatment was removed.
10. **Rebuild “Pick your bots” cards and copy/accents.** **Worked in source:** six specified bot cards, command pills, accents, and responsive grid exist.
11. **Rebuild Why Aurex, final CTA, and footer.** **Worked in source and committed as `32ca883`:** requested content/cards/buttons/footer markup and style are present.
12. **Audit-only cleanup:** fix pixel-font remnants, cut/overlapping text, incorrect bot names, placeholder dashes/Temporary, missing login CTA, 390/768 layout. **Worked in source per prior audit record:** stale placeholder invite fallbacks were removed, review tags updated, and prior responsive recheck reported no horizontal overflow/missing CTA; commit `873f0a9`. No new test/build is run in this handoff task.
13. **Current handoff-pack request:** read actual project/history/deployment, create `docs/HANDOFF.md` and `docs/DESIGN_TOKENS.json`, make no site-code changes and run no build, then commit and push. **Completed as a documentation-only change; no build or test was run for this handoff.**

## M. Next tasks in priority order

1. Replace the sample review names/quotes with owner-approved real testimonials; include Ping only when a real quote is approved. Do not remove the “Sample /” label until the content is verified.
2. Reconcile the founder signature with the latest requested name “Obsidian” in a separately authorized site-code change.
3. Decide whether to implement the original reviews gallery mechanics exactly (500vh, seven mobile cards, Z travel/depth/fade thresholds, always-visible center title, `(00)` counter, static reduced-motion mode), or formally accept the current arc treatment.
4. Consolidate `public/styles.css` to remove stale duplicate token/accent/breakpoint blocks while preserving tested computed appearance; run visual checks after each pass.
5. Update or clearly archive `docs/MASTER_SESSION_SUMMARY.md`, `TODO.md`, and out-of-repo portions of `docs/SETUP_GUIDE.md` so future sessions do not follow stale repository, branch, design, or command instructions.
6. Verify the Vercel production-domain mapping/verification and human-readable team name once correct account scope is available; confirm latest preview after this documentation commit.
7. Validate real Discord OAuth callback, database health, six bot invites, server permissions, and dashboard save flow without exposing secrets. Record only environment variable names/status.
8. Audit dashboard reduced-motion behavior and security caveats (session-secret fallback, GET logout, per-instance rate limit).
9. Complete 1440px responsive/visual checks; 390px and 768px have prior audit evidence but were not rerun here.
10. Decide if unused assets `aurex-logo.jpg` and `shot-1..3.png` should be retained or removed in a future authorized cleanup.

## N. Test checklist and rollback

### Responsive and functional checklist

- [x] **390px:** prior audit screenshots/checks on landing page and dashboard; previous summary reports no horizontal overflow and Login with Discord visible. Not freshly rerun during this handoff.
- [x] **768px:** prior audit screenshots/checks on landing page and dashboard; previous summary reports no horizontal overflow and Login with Discord visible. Not freshly rerun during this handoff.
- [ ] **1440px:** not verified in the recorded final audit. Inspect header, hero line breaks, module pin/stage, gallery title/cards/gutters, founder copy, demo window, comparison, bento proportions, suite grid, Why cards, CTA/footer, and scroll-rail final dot.
- [ ] At all widths, confirm keyboard focus, menu open/close, visible Discord action, no horizontal scrolling, image/video poster fallback, and review sample labeling.
- [ ] Motion preferences: verify hero reveals, module stack/desktop pin, review behavior, product demo final still, loading shimmer on dashboard.
- [ ] Functional: `npm test`; `/api/health`; OAuth login/callback/logout; guild list/permissions; module config reads and writes; real `/api/invites` URLs. Live diagnostics can contact services or write data; review each script before execution.
- Historical note: prior project report states the automated tests passed **39/39** after the audit commit. This was not rerun for the documentation-only task. Do not treat live service status as tested.

### Safe validation steps

1. On a fresh clone: `npm install`, then `npm test`.
2. Start local server with `npm run dev`; inspect `http://localhost:3000/` and `/dashboard.html` at viewport widths 390, 768, and 1440.
3. If changing `ReviewsGallery.tsx`, run `npm run build:reviews-gallery`, then verify `public/reviews-gallery.js` is included in the same change. This build was intentionally not run for this handoff.
4. Push only the feature branch for a Vercel preview; inspect its status/alias before sharing. Production deploy script is `scripts/deploy.ps1` and must not be run without explicit production-deploy authorization.

### Rollback

- This handoff is documentation-only. To reverse its commit without rewriting shared history: `git revert <handoff-commit-sha>` on `preview-redesign`, then push that branch.
- To roll back a preview site-code change later, revert its commit on the feature branch and push; do not merge to `main`.
- For a production deployment rollback, use Vercel's deployment rollback/alias controls to restore the prior known-good production deployment. Do not run `vercel deploy --prod` or modify/merge `main` as an unapproved shortcut.
- Before rollback, confirm branch/status with `git status --short --branch` and record the exact commit being reverted.

## O. Ready-to-paste resume prompt for a new account

```text
Continue the Aurex Discord Bots website handoff from the existing GitHub repo https://github.com/Adityarajx11/dominyx-discord-bots. First read docs/HANDOFF.md and docs/DESIGN_TOKENS.json, then inspect actual Git status/history and Vercel deployment state; do not rely on old docs without checking them. Work only on branch preview-redesign. Never change or merge main unless I explicitly authorize it. Keep site code unchanged unless I ask for a code change; preserve the current product/dashboard/auth flows. Current production is documented as https://aurex-control.vercel.app; branch preview alias was https://aurex-control-git-preview-redesign-adityarajx11.vercel.app, but re-verify both before relying on them. Never reveal secret values; environment variables may be listed by name only. Current design is #050505 / #0B0D12 / #F4F4F0 / #8A8F98 / #5CE1E6 with Space Grotesk, Instrument Serif italic, Inter and JetBrains Mono; no pixel fonts. Use premium wording, never call the product simple or cheap, and use “Obsidian” for the founder signature if changing that section. Reviews are sample data and must not be presented as real endorsements. Follow the next-priority list in the handoff, test at 390px, 768px and 1440px, respect reduced motion, and do not merge. Ask before production deployment or any destructive/high-impact action.
```
