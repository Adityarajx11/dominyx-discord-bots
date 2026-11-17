# Aurex redesign findings

**Inspection date:** 2026-11-17  
**Source of truth:** GitHub `preview-redesign` at `fc5dd5f` (`Add exact Porsche footer motion strip`)  
**Working branch:** `background-redesign`

## Stack and runtime

Aurex is a static HTML/CSS/vanilla JavaScript landing page served by a Node.js ESM HTTP server. The same server exposes the Discord OAuth/session/dashboard APIs and is adapted for Vercel through `api/index.mjs`. The review gallery is the only React/TypeScript surface; it is bundled with esbuild into `public/reviews-gallery.js`. npm is the package manager, Node is pinned to `>=20`, and the existing automated suite contains 39 tests.

## What currently draws the background

`public/index.html` contains a full-page `.site-background` with autoplaying MP4/WebM video sources and a poster fallback. CSS applies opacity, saturation, brightness, contrast, and global/top shade layers. `public/main.js` attempts to autoplay the video and updates `--scroll-zoom` while scrolling. The current system has no bot-aware color crossfade, canvas grain/aurora layer, device-pixel-ratio cap, or explicit pause-on-hidden/off-screen lifecycle.

## How scroll pinning currently works

The six-module story uses a sticky full-viewport `.module-story-stage`. On desktop, GSAP 3.12.5 and ScrollTrigger create one timeline from `top top` to `bottom bottom`, with `scrub: 0.6` and six snap positions. The active panel, counter, progress line, dots, and accent interpolation are updated in `onUpdate`. On mobile and reduced motion, the panels become a normal stack with IntersectionObserver or static visibility.

The review gallery has a separate 560vh wrapper and a `position: sticky` 100svh stage. Its React component runs its own requestAnimationFrame interpolation rather than using GSAP or Lenis.

## Confirmed source issues

- The reviews component still ships 14 hard-coded, explicitly sample reviews, renders `Sample / ...`, fake star ratings, a percentage counter, a vertical `Reviews` label, and a long sticky choreography. This conflicts with the no-fake-data requirement and explains the sparse/overlap-prone review experience.
- Module dots are only 7–8px visual buttons on desktop/mobile, have no 44px hit area, and are not hidden when the story is outside the viewport. The active state is updated in source, but the current interaction is fragile around pinned/stacked transitions.
- The left page rail creates 5px/7px visual `<span>` elements with `role="img"`; they have labels but are not usable navigation targets or meaningful hit areas. It is hidden on small screens without a simplified replacement.
- The page contains two six-bot presentations: the pinned module story and the later `#bot-suite` grid. The comparison/bento area also repeats the “Modular” concept. This is the main source of page length and repeated content.
- The `why-card` rules use large minimum heights and generous padding, leaving avoidable lower-card whitespace at some widths.
- Body copy and metadata frequently use `#8A8F98`/nearby muted values on dark surfaces at small sizes; contrast needs a measured AA pass rather than a visual assumption.
- The current footer artwork is no longer hard-edged, but it is still constrained by the `.site-footer` container width rather than being a true viewport-bleed ending. The current source also hides the original signal-field option completely.
- No in-source selector for the reported half-clipped floating round button was found in the landing-page markup or active JavaScript. It must be checked in the rendered page and removed or documented if it is an external preview/browser control.
- The navigation has a sticky dark/blurred treatment and z-index, but the accumulated stylesheet contains repeated legacy rules. The redesign should consolidate the final header layer, add scroll-padding/anchor offsets, and validate pinned content against it at all target widths.

## Assets and security

The repository has the existing 64px white Aurex mark and a 1024px JPEG mark, but the newly uploaded image set contains screenshots and the Porsche/footer reference rather than clean standalone vector logo files. The available mark can be used as the tracing reference; any uncertainty about the exact monogram silhouette should remain documented rather than silently inventing a different brand mark.

The Porsche artwork is available as `public/assets/aurex-footer-porsche.webp` and the supplied source `IMG_0002.WEBP` is approximately 308KB. The current cropped asset removes the reference brand text and is suitable for the default trail option.

A literal history scan across tracked JavaScript, HTML, CSS, TypeScript, JSON, and environment files found no committed `DISCORD_CLIENT_SECRET`, `DATABASE_URL`, bot token, or PostgreSQL connection string. Secret values remain environment-only; no gateway bots will be moved to Vercel.

## Accepted design direction

Use Aurex as the canonical brand. Keep the black base, cyan signal, grotesk display type, and italic serif accents. Replace smoky background treatment with a restrained dark canvas system: film grain, soft aurora, bot-accent crossfade, capped DPR, visibility/off-screen pausing, and a static reduced-motion/low-power path. Keep the real headline as HTML and make the six-bot fracture/reform a scroll-driven original effect, not a copied asset or code path.
