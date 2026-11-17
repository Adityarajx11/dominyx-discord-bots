# Aurex background redesign plan

## Direction

**Design movement:** cinematic signal-field interface — a dark editorial Discord control surface where motion behaves like a quiet operating system rather than decoration.

**Core principles:** keep the content legible over motion; use one cyan signal with bot-specific accents; make scroll state understandable through accessible markers; prefer honest empty states over invented proof.

**Color philosophy:** near-black is the stage, cool graphite is the surface, and cyan is the navigation/control signal. Bot colors appear only where a module is active, so the palette changes with meaning instead of becoming a rainbow wash.

**Layout paradigm:** a long editorial sequence with one focused pinned bot story, followed by compact proof, control walkthrough, principles, CTA, and a full-bleed footer finale. Repeated bot content is removed from the later suite grid.

**Signature elements:** a four-point sparkle motif for active markers; an aurora/grain field that follows the active bot; six fracture shards that assemble around the real HTML headline.

**Interaction philosophy:** every animated state has a readable static state. Scroll drives the story; buttons remain keyboard/touch controls; motion pauses when it cannot be seen or should not run.

**Animation:** use the existing pinned module story as the only long pinned narrative, with a short hero scrub before it. Use GSAP/ScrollTrigger 3.12.5 already present; do not add Lenis unless a concrete scroll-sync problem remains after the native/GSAP pass. Cap canvas DPR at 1.5, pause off-screen/hidden effects, and fully disable decorative motion under reduced-motion or low-power fallback.

**Typography:** Space Grotesk for display and UI headings, Inter for body copy, JetBrains Mono for system labels and commands, Instrument Serif italic for selected accent words. Never place critical copy inside an image.

**Brand essence:** Aurex is a modular Discord operating layer for communities that want focused tools instead of an all-in-one bot. Personality: precise, calm, signal-led.

**Brand voice:** direct, quietly technical, and human. Example lines: “Six focused bots. One calmer server.” and “Add only what your community needs.”

**Wordmark and logo:** preserve the existing A monogram with its four-point sparkle as the primary mark. Trace it into a clean SVG family rather than inventing an unrelated symbol; use wordmark text as live HTML where the source asset is not supplied.

**Signature brand color:** `#5CE1E6` cyan.

## Phased implementation

### Phase 1 — bug fixes

Consolidate the final header layer and anchor offsets; replace the fake review gallery with an honest, compact “reviews coming soon” placeholder using the monogram orb; repair module-dot state, 44px hit targets, and viewport visibility; turn the page rail into accessible buttons with labels and a mobile progress treatment; remove the unexplained floating control if it is part of the page; raise secondary-text contrast; tighten the Why Aurex cards; and remove the duplicate `#bot-suite` six-card presentation while retaining one clear install CTA per module.

### Phase 2 — logo and brand assets

Create clean Aurex mark SVGs in white, cyan, and black from the existing mark reference; add favicon SVG/PNG, 180px Apple touch icon, 512px icon, and a 1200×630 Open Graph asset. Apply the mark consistently in the navbar, footer, loading state, 404 response, dashboard header, and Discord login surface. Use the sparkle only for active states and dividers. Keep asset generation deterministic from the supplied reference and document any silhouette limitation.

### Phase 3 — background

Replace the current smoky treatment with a lightweight canvas/CSS system: dark base, subtle grain, blurred aurora blobs, and an active accent variable crossfaded from the current bot story. Keep a poster/static fallback. Use IntersectionObserver/ScrollTrigger state to update the active accent; pause when hidden or off-screen; cap DPR; and use a static low-power/reduced-motion path. Retain the existing video only as a fallback if it improves the real preview without reintroducing the smudged appearance.

### Phase 4 — hero

Add six original shard elements around the real HTML “Six bots.” headline. Scrub their opacity, translation, rotation, and bot tint through the first hero-to-module transition; reform them before the module story begins. Keep the existing CTA labels and keyboard/focus behavior. Do not copy the inspiration site's code or assets and do not make the headline image-based.

### Phase 5 — footer

Implement a configuration flag such as `data-footer-art="trail"` on the root. Default to `trail`, using the exact cleaned Porsche/light-trail asset with responsive source sizing and a gradient top dissolve. Add an `aurex` option rendered as original six-color particle ribbons converging through the monogram, with a static fallback. Make the artwork true viewport bleed, keep the columns over a subtle starfield, preserve real destinations, use 44px social targets, remove the hard-coded fake online status, and verify iPad landscape does not push links off-screen.

### Phase 6 — polish and tests

Remove stale CSS declarations created by earlier iterations where safe, add accessible focus/reduced-motion states, rebuild generated review/runtime assets if required, run the existing 39-test suite plus static/route checks, inspect at 390px, iPad portrait/landscape, and desktop widths, capture before/after section screenshots, measure mobile Lighthouse/LCP, update handoff documentation, commit one phase at a time, push the branch, and open a PR with the resulting preview URL.

## Project structure

- `public/index.html` — landing page markup, route-facing metadata, background canvas, hero shards, sections, and footer flag.
- `public/styles.css` — consolidated Aurex design system, responsive layout, accessibility states, and background/hero/footer presentation.
- `public/main.js` — auth CTA state, background lifecycle, module story, hero scrub, page rail, and section observers.
- `src/components/ReviewsGallery.tsx` and `src/mount-reviews-gallery.tsx` — either the honest reviews placeholder source or removed mount after consolidation.
- `public/assets/` — optimized logo/icon variants, poster/fallback images, and both footer artwork assets.
- `server.mjs` and `api/index.mjs` — static allowlist/API adapter only; no Discord gateway runtime.
- `dashboard.html`, `dashboard.css`, `dashboard.js` — branded dashboard/login surfaces using the same Aurex mark family.
- `docs/REDESIGN_FINDINGS.md` — source-confirmed inspection and security scan.
- `docs/REDESIGN_HANDOFF.md` — final change list, footer switch instructions, test evidence, screenshots, and unfinished decisions.
