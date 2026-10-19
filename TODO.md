# Dominyx delivery outcomes

## Responsive full-site composition
- Use a full-viewport first-screen composition with the exact supplied CloudFront MP4 as a muted, autoplaying, looping background video, then continue into a scrollable suite, principles, connection CTA, and footer.
- Keep the video visible enough to read its moving numeric texture while retaining a premium black-and-lavender Dominyx overlay system, semantic structure, responsive typography, and reduced-motion-friendly UI behavior.

## Dominyx header and navigation
- Center a desktop header with a real circular Dominyx mark, pill navigation, and a primary CTA.
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
