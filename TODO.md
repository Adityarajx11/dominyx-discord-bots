# Aurex delivery outcomes

## Responsive full-site composition
- Use a full-viewport first-screen composition with the restored moving motion background recolored into neutral black, white, and gray, then continue into a scrollable suite, principles, connection CTA, and footer.
- Keep the recolored motion background visible enough to add depth while retaining a premium neutral black, white, and gray Aurex overlay system, semantic structure, responsive typography, and reduced-motion-friendly UI behavior.

## Aurex header and navigation
- Center a desktop header with a real circular Aurex mark, pill navigation, and a primary CTA.
- Include clear in-viewport navigation for the bot suite and the brand story.
- Provide an accessible mobile hamburger control with animated overlay sheet, navigation, CTA, and bot exploration links.

## Six-bot exploration interaction
- Present clear labeled controls for Music, Security, Greet, Ping, Ticket, and Level.
- Let visitors explore each bot through a compact in-viewport state change without introducing hero cards.
- Use Discord-themed iconography and concise bot-focused copy.
- Include a full bot-suite section with an “Add [Bot]” button for every bot, wired through a centralized placeholder OAuth map in `main.js` so each Discord invite URL can be configured independently.

## Hero and proof footer
- Include a Discord-themed trust row, solid-white dot-matrix display headline, concise bot-focused subhead, and prominent CTA.
- Include four relevant proof metrics with JavaScript count-up animations.
- Include subtle entrance and interaction animations with solid white headline treatment, soft shadows, and mobile support.

## Static implementation and delivery
- Implement with semantic plain HTML, CSS, and vanilla JavaScript.
- Load Inter, BubbledotICG-FinePos, and Font Awesome 6.5.2 from the approved public CDNs.
- Serve `manus-routes.json` for `/` and `/dashboard.html` and keep the project compatible with the configured Preview runtime.

## Dashboard authentication and controls
- Provide a `/dashboard.html` experience with a Discord OAuth login gate, user state, logout, manageable-server selection, six module controls, and mobile-responsive layouts.
- Use an encrypted server-side session cookie; keep Discord OAuth secrets, bot tokens, the shared Railway Postgres URL, and the session secret out of browser code and public GitHub files.
- Proxy authorized settings reads and writes through a server endpoint, with Discord permission checks for Administrator or Manage Server users; the intended old-project-compatible adapter uses server-side Discord bot tokens plus the shared Postgres database, not a browser-side Railway API.
- Expose the required environment variables through secure hosting configuration and document the direct Discord/Postgres adapter contract without assuming direct Postgres access from the browser.

## Aurex background redesign — phase 1: bug fixes
- Use the `preview-redesign` source as the authority and preserve the Aurex brand; do not rebuild from the older `main` page.
- Give the sticky navbar a solid or blurred background with a fallback, correct z-index, an anchor offset, and scroll-padding so content never scrolls over the links or Login button.
- Remove the fake review data, `Sample / ...` labels, fake star ratings, percentage counter, vertical Reviews label, and near-empty choreography; show an honest placeholder until real quotes are supplied.
- Keep the six bot carousel dots synchronized with the active bot, make them 44px tap targets, make them clickable, and hide them when the section is out of view.
- Add accessible labels and larger hit areas to the left progress rail and simplify it on small screens.
- Check the half-clipped round floating control; remove it if it belongs to the site and document it if it is an external preview/browser control.
- Raise secondary text to WCAG AA contrast, tighten the Why Aurex cards, consolidate duplicate six-bot presentations, and ensure no scroll position opens on a near-empty screen.

## Aurex background redesign — phase 2: logo and brand assets
- Preserve the existing A monogram with its four-point sparkle as the primary Aurex mark and convert it into clean white, cyan, and black SVG variants without inventing a different logo.
- Add favicon SVG and 32px PNG, 180px Apple touch icon, 512px icon, and a 1200x630 Open Graph image with the monogram and live wordmark on the dark Aurex background.
- Use the mark in the navbar, footer, loading state, 404 page, dashboard header, Discord login area, and the reviews placeholder orb; use the sparkle sparingly as active markers and dividers.

## Aurex background redesign — phase 3: background system
- Replace smoky wisps with a dark base, subtle film grain, and a soft aurora glow that crossfades to each bot's accent color as its section enters the viewport.
- Cap device pixel ratio, pause when the tab is hidden or the effect is off-screen, and provide a static fallback for reduced motion and low-power/mobile conditions.

## Aurex background redesign — phase 4: hero transition
- Keep “Six bots.” as real HTML text and add an original scroll-driven six-shard fracture/reform transition, tinted with the six bot colors, without copying the inspiration site's code or assets.
- Keep the “Explore the bots” and “Open dashboard” actions and preserve keyboard/focus behavior.

## Aurex background redesign — phase 5: cinematic footer
- Support both footer art modes behind one config flag, defaulting to `data-footer-art="trail"`: the supplied cleaned Porsche/light-trail artwork and an original six-ribbon Aurex particle artwork with a static fallback.
- Make the default artwork true full-bleed viewport width, anchored at the bottom with no hard container edge; dissolve the top edge with a gradient mask and retain a subtle starfield behind the link columns.
- Pause footer motion off-screen, use a static reduced-motion/low-power path, cap DPR, optimize responsive image sizes to about 300KB per size, and keep descriptive alt text.
- Keep Product / Company / Resources / Built for Discord columns; make every link real, social controls 44px with real URLs and aria-labels, improve contrast, remove the hard-coded fake online status, and keep mobile at 2x2 columns without horizontal scroll.

## Aurex background redesign — phase 6: motion, polish, and delivery
- Use the existing pinned GSAP/ScrollTrigger 3.12.5 intentionally, keep no more than two pinned sections, add subtle section reveals, and respect `prefers-reduced-motion`; add Lenis only if a measured scroll-sync issue requires it.
- Never commit bot tokens, OAuth secrets, or database URLs; use environment variables only, keep `.env.example`, and do not run Discord gateway bots on Vercel.
- Verify desktop Chrome, iPad landscape/portrait, and 390px phone width; capture every section including the footer, confirm navbar/edge/overflow behavior, and report mobile Lighthouse performance and LCP.
- Deliver the findings note, six phase commits on `background-redesign`, PR, preview URL, complete change list including logo placements and footer switching, before/after screenshots, and anything unfinished or awaiting a decision.
