// Invite links are built server-side from the bot application IDs and loaded
// from /api/invites. The placeholder map below is only a fallback.
const botInviteLinks = {
  music: 'PASTE_MUSIC_OAUTH_URL_HERE',
  security: 'PASTE_SECURITY_OAUTH_URL_HERE',
  greet: 'PASTE_GREET_OAUTH_URL_HERE',
  ping: 'PASTE_PING_OAUTH_URL_HERE',
  ticket: 'PASTE_TICKET_OAUTH_URL_HERE',
  level: 'PASTE_LEVEL_OAUTH_URL_HERE'
};

function applyInviteLinks(links) {
  document.querySelectorAll('[data-bot-invite]').forEach((link) => {
    const key = link.dataset.botInvite;
    const invite = links?.[key];
    if (invite && invite.startsWith('http')) link.href = invite;
  });
}

applyInviteLinks(botInviteLinks);

fetch('/api/invites')
  .then((response) => (response.ok ? response.json() : null))
  .then((links) => {
    if (links && Object.keys(links).length) applyInviteLinks(links);
  })
  .catch(() => {});

const botData = {
  music: {
    label: 'MODULE / MUSIC',
    title: 'Keep the room moving.',
    description: 'Bring a clean listening layer to every voice channel. Queue a playlist, hand off the controls, and let the room stay in rhythm.',
    tags: ['PLAYLISTS', 'QUEUE CONTROL', 'VOICE CHANNELS'],
    metrics: ['24/7', '01 click', '0 clutter'],
    metricLabels: ['VOICE UPTIME', 'TO TAKE OVER', 'IN TEXT CHAT']
  },
  security: {
    label: 'MODULE / SECURITY',
    title: 'Keep the chaos outside.',
    description: 'Anti-raid, anti-nuke, automod filters, and clear moderation signals for a calmer community.',
    tags: ['ANTI-RAID', 'ANTI-NUKE', 'MOD-LOGS'],
    metrics: ['24/7', '01 shield', '0 noise'],
    metricLabels: ['SERVER WATCH', 'TO LOCK DOWN', 'IN THE FEED']
  },
  greet: {
    label: 'MODULE / GREET',
    title: 'Make joining feel human.',
    description: 'Welcome cards, auto-roles, goodbye messages, and a first impression that feels like your community.',
    tags: ['WELCOME CARDS', 'AUTO-ROLES', 'GOODBYES'],
    metrics: ['01 card', '02 flows', '100% warm'],
    metricLabels: ['FIRST IMPRESSION', 'JOIN + LEAVE', 'COMMUNITY FEEL'],
    format: 'quote'
  },
  ping: {
    label: 'MODULE / PING',
    title: 'Say it once. Reach everyone.',
    description: 'Route YouTube live alerts to the right people with custom messages, schedules, and role mentions.',
    tags: ['LIVE ALERTS', 'ROLE MENTIONS', 'SCHEDULES'],
    metrics: ['01 signal', '0 missed', '10 min'],
    metricLabels: ['PER EVENT', 'IN THE LOOP', 'POLL WINDOW']
  },
  ticket: {
    label: 'MODULE / TICKET',
    title: 'Support, without the queue.',
    description: 'Private ticket panels, staff claims, priorities, auto-close, and transcripts that keep support moving.',
    tags: ['PANELS', 'STAFF CLAIMS', 'TRANSCRIPTS'],
    metrics: ['01 click', '100% private', '0 chaos'],
    metricLabels: ['TO OPEN', 'SUPPORT THREADS', 'IN THE QUEUE']
  },
  level: {
    label: 'MODULE / LEVEL',
    title: 'Turn activity into status.',
    description: 'Reward the people who make the community worth coming back to with XP, ranks, leaderboards, and roles.',
    tags: ['XP + RANKS', 'LEADERBOARDS', 'ROLE REWARDS'],
    metrics: ['01 rank', '∞ momentum', '0 grind'],
    metricLabels: ['PER MEMBER', 'IN THE SERVER', 'WITHOUT FRICTION']
  }
};

const authCtas = document.querySelectorAll('[data-auth-cta]');

// Signed-out visitors are sent to the Aurex authentication page, which has the
// button that starts the Discord flow. Once signed in, the same buttons open
// the dashboard directly.
async function syncAuthCtas() {
  try {
    const response = await fetch('/api/auth/me', { credentials: 'include' });
    if (!response.ok) return;
    const session = await response.json();
    if (!session.authenticated) return;
    authCtas.forEach((cta) => {
      cta.href = '/dashboard.html';
      cta.innerHTML = 'Open Dashboard <i class="fa-solid fa-gauge-high" aria-hidden="true"></i>';
      cta.classList.add('is-authenticated');
    });
  } catch {
    // The logged-out Login with Discord state remains the safe default.
  }
}
syncAuthCtas();

const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');
const closeTargets = document.querySelectorAll('[data-menu-close], .mobile-link, .mobile-connect');
const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
const bgVideo = document.querySelector('.bg-video');

let scrollFrame = 0;
function updateScrollMotion() {
  scrollFrame = 0;
  if (reduceMotion) return;
  const progress = Math.min(Math.max(window.scrollY / Math.max(window.innerHeight * 0.9, 1), 0), 1);
  document.documentElement.style.setProperty('--scroll-zoom', (progress * 0.12).toFixed(4));
  document.documentElement.style.setProperty('--scroll-hero-lift', `${(progress * -24).toFixed(2)}px`);
}
function requestScrollMotion() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollMotion);
}
window.addEventListener('scroll', requestScrollMotion, { passive: true });
updateScrollMotion();

if (bgVideo) {
  bgVideo.controls = false;
  bgVideo.removeAttribute('controls');
  bgVideo.setAttribute('aria-hidden', 'true');
  const startBackgroundVideo = () => {
    bgVideo.play().catch(() => {
      // Autoplay is muted, but some embedded browsers still require a retry.
    });
  };
  bgVideo.addEventListener('canplay', startBackgroundVideo);
  startBackgroundVideo();
}

function setMenu(open) {
  if (!menuToggle || !mobileMenu) return;
  menuToggle.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  mobileMenu.hidden = !open;
  mobileMenu.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('menu-open', open);
}

menuToggle?.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
closeTargets.forEach((target) => target.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 720) setMenu(false);
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    event.preventDefault();
    const offset = Math.max(18, Math.min(42, window.innerHeight * 0.04));
    const destination = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: destination, behavior: 'smooth' });
    history.replaceState(null, '', targetId);
  });
});

const readoutLabel = document.querySelector('#readout-label');
const readoutTitle = document.querySelector('#readout-title');
const readoutDescription = document.querySelector('#readout-description');
const readoutTags = document.querySelector('#readout-tags');
const readoutStats = [document.querySelector('#readout-stat-one'), document.querySelector('#readout-stat-two'), document.querySelector('#readout-stat-three')];
const readoutStatLabels = [document.querySelector('#readout-stat-one-label'), document.querySelector('#readout-stat-two-label'), document.querySelector('#readout-stat-three-label')];
const botReadout = document.querySelector('#bot-readout');
const botTabs = document.querySelectorAll('.bot-tab');

function renderBot(key) {
  const bot = botData[key];
  if (!bot) return;
  botTabs.forEach((tab) => {
    const selected = tab.dataset.bot === key;
    tab.classList.toggle('is-selected', selected);
    tab.setAttribute('aria-selected', String(selected));
  });
  if (readoutLabel) readoutLabel.textContent = bot.label;
  if (readoutTitle) readoutTitle.textContent = bot.title;
  if (readoutDescription) readoutDescription.textContent = bot.description;
  botReadout?.classList.toggle('is-quote', bot.format === 'quote');
  if (readoutTags) readoutTags.innerHTML = bot.tags.map((tag) => `<span>${tag}</span>`).join('');
  readoutStats.forEach((node, index) => { if (node) node.textContent = bot.metrics[index]; });
  readoutStatLabels.forEach((node, index) => { if (node) node.textContent = bot.metricLabels[index]; });
}

botTabs.forEach((tab) => tab.addEventListener('click', () => renderBot(tab.dataset.bot)));

const countNodes = document.querySelectorAll('[data-count]');
const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);

function animateCount(node, index) {
  const target = Number(node.dataset.count || 0);
  const decimals = Number(node.dataset.decimals || 0);
  if (reduceMotion) {
    node.textContent = target.toFixed(decimals);
    return;
  }
  const duration = 1200 + index * 90;
  const start = performance.now();
  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const value = target * easeOutCubic(progress);
    node.textContent = value.toFixed(decimals);
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        countNodes.forEach((node, index) => animateCount(node, index));
        currentObserver.disconnect();
      }
    });
  }, { threshold: 0.25 });
  const stats = document.querySelector('.stats-footer');
  if (stats) observer.observe(stats);
} else {
  countNodes.forEach((node) => { node.textContent = Number(node.dataset.count).toFixed(Number(node.dataset.decimals || 0)); });
}
