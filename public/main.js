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
window.setTimeout(() => {
  document.querySelectorAll('.hero .anim').forEach((element) => {
    element.style.opacity = '1';
    element.style.transform = 'none';
    element.style.filter = 'none';
  });
}, 1600);
if (bgVideo) {
  bgVideo.muted = true;
  bgVideo.defaultMuted = true;
  bgVideo.autoplay = true;
  bgVideo.loop = true;
  bgVideo.playsInline = true;
  bgVideo.controls = false;
  ['muted', 'autoplay', 'loop', 'playsinline', 'webkit-playsinline', 'preload', 'disablepictureinpicture'].forEach((name) => {
    bgVideo.setAttribute(name, name === 'preload' ? 'auto' : '');
  });
  bgVideo.removeAttribute('controls');
  const playBackground = () => { if (bgVideo.paused) bgVideo.play().catch(() => {}); };
  window.addEventListener('load', playBackground, { once: true });
  document.addEventListener('touchstart', playBackground, { once: true, passive: true });
  document.addEventListener('pointerdown', playBackground, { once: true, passive: true });
  document.addEventListener('visibilitychange', playBackground);
  window.addEventListener('pageshow', playBackground);
  playBackground();
}

// The six real bot modules are driven by scroll position (not a timer).
const story = document.querySelector('[data-module-story]');
if (story) {
  const panels = [...story.querySelectorAll('[data-story-panel]')];
  const dots = [...story.querySelectorAll('[data-story-dot]')];
  const stage = story.querySelector('.module-story-stage');
  const commandNodes = panels.map((panel) => panel.querySelector('[data-command-text]'));
  const resultNodes = panels.map((panel) => panel.querySelector('[data-story-result]'));
  const nameNodes = panels.map((panel) => panel.querySelector('[data-story-name]'));
  const progressFill = story.querySelector('[data-story-progress-fill]');
  const counterReel = story.querySelector('[data-story-counter]');
  const progressBar = story.querySelector('.story-step-progress');
  const accentColors = panels.map((panel) => panel.style.getPropertyValue('--bot-accent').trim());
  const pageRail = document.querySelector('[data-page-scroll-rail]');

  const makeWordSpans = (node) => {
    const words = node.textContent.trim().split(/\s+/);
    node.textContent = '';
    words.forEach((word, index) => {
      if (index) node.append(document.createTextNode(' '));
      const span = document.createElement('span');
      span.className = 'story-word';
      span.textContent = word;
      node.append(span);
    });
    return [...node.querySelectorAll('.story-word')];
  };
  const nameWordNodes = nameNodes.map(makeWordSpans);
  const commandCharNodes = commandNodes.map((node) => {
    const command = node.textContent;
    node.setAttribute('aria-label', command);
    node.textContent = '';
    const spans = Array.from(command, (character) => {
      const span = document.createElement('span');
      span.className = 'story-command-char';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = character === ' ' ? '\u00a0' : character;
      node.append(span);
      return span;
    });
    return spans;
  });
  const setActiveStoryStep = (index, hideOtherPanels = true) => {
    panels.forEach((panel, i) => {
      panel.classList.toggle('is-active', i === index);
      panel.setAttribute('aria-hidden', String(hideOtherPanels && i !== index));
    });
    dots.forEach((dot, i) => {
      if (i === index) dot.setAttribute('aria-current', 'step');
      else dot.removeAttribute('aria-current');
    });
    const counter = story.querySelector('.story-counter');
    if (counter) counter.setAttribute('aria-label', `Module ${String(index + 1).padStart(2, '0')} of 06`);
    if (progressBar) progressBar.setAttribute('aria-valuenow', String(index + 1));
  };

  if (!window.gsap || !window.ScrollTrigger) {
    story.classList.add('is-stacked');
    panels.forEach((panel) => { panel.style.visibility = 'visible'; panel.style.opacity = '1'; panel.style.transform = 'none'; panel.setAttribute('aria-hidden', 'false'); });
  } else {
    gsap.registerPlugin(ScrollTrigger);
    const storyMedia = gsap.matchMedia();

    storyMedia.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      story.classList.remove('is-stacked');
      gsap.set(panels, { autoAlpha: 0, y: 34 });
      gsap.set(panels[0], { autoAlpha: 1, y: 0 });
      gsap.set(nameWordNodes[0], { autoAlpha: 1, y: 0 });
      gsap.set(commandCharNodes[0], { autoAlpha: 1 });
      gsap.set(resultNodes[0], { autoAlpha: 1, y: 0 });
      panels.forEach((panel, index) => {
        if (index === 0) return;
        gsap.set(nameWordNodes[index], { autoAlpha: 0, y: 16 });
        gsap.set(commandCharNodes[index], { autoAlpha: 0 });
        gsap.set(resultNodes[index], { autoAlpha: 0, y: 8 });
      });

      const storyTimeline = gsap.timeline({
        scrollTrigger: {
          id: 'aurex-module-story',
          trigger: story,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
          snap: { snapTo: 1 / (panels.length - 1), duration: 0.5, delay: 0.04, ease: 'power1.inOut' },
          onUpdate: (self) => {
            const scaled = self.progress * (panels.length - 1);
            const active = Math.min(panels.length - 1, Math.round(scaled));
            setActiveStoryStep(active);
            if (stage) stage.style.setProperty('--stage-accent', gsap.utils.interpolate(accentColors[Math.floor(scaled)], accentColors[Math.min(panels.length - 1, Math.floor(scaled) + 1)], scaled % 1));
          }
        }
      });

      storyTimeline.to(progressFill, { scaleX: 1, duration: panels.length, ease: 'none' }, 0);
      storyTimeline.to(counterReel, { yPercent: -83.333333, duration: panels.length, ease: 'none' }, 0);
      panels.forEach((panel, index) => {
        const at = index;
        if (index > 0) {
          storyTimeline.to(panels[index - 1], { autoAlpha: 0, y: -36, duration: 0.28, ease: 'power1.in' }, at);
          storyTimeline.fromTo(panel, { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 0.30, ease: 'power2.out' }, at);
        }
        storyTimeline.to(nameWordNodes[index], { autoAlpha: 1, y: 0, duration: 0.2, stagger: 0.075, ease: 'power2.out' }, at + 0.08);
        storyTimeline.to(commandCharNodes[index], { autoAlpha: 1, duration: 0.01, stagger: 0.009, ease: 'none' }, at + 0.34);
        storyTimeline.to(resultNodes[index], { autoAlpha: 1, y: 0, duration: 0.18, ease: 'power1.out' }, at + 0.78);
      });
      storyTimeline.to({}, { duration: 1 }, panels.length - 1);

      dots.forEach((dot) => dot.addEventListener('click', () => {
        const trigger = ScrollTrigger.getById('aurex-module-story');
        if (!trigger) return;
        const index = Number(dot.dataset.storyDot);
        const destination = trigger.start + ((trigger.end - trigger.start) * index / (panels.length - 1));
        window.scrollTo({ top: destination, behavior: 'smooth' });
      }));

      return () => { story.classList.remove('is-stacked'); };
    });

    storyMedia.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
      story.classList.add('is-stacked');
      panels.forEach((panel, index) => {
        gsap.set(panel, { autoAlpha: 1, y: 0, clearProps: 'transform' });
        const reveal = gsap.timeline({ scrollTrigger: { trigger: panel, start: 'top 82%', toggleActions: 'play none none reverse' } });
        reveal.fromTo(nameWordNodes[index], { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.06, ease: 'power2.out' }, 0);
        reveal.to(commandCharNodes[index], { autoAlpha: 1, duration: 0.008, stagger: 0.006, ease: 'none' }, 0.12);
        reveal.fromTo(resultNodes[index], { autoAlpha: 0, y: 5 }, { autoAlpha: 1, y: 0, duration: 0.18 }, 0.38);
      });
      panels.forEach((panel) => panel.setAttribute('aria-hidden', 'false'));
      const activeObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = Math.max(0, panels.indexOf(entry.target));
          setActiveStoryStep(index, false);
          if (counterReel) gsap.set(counterReel, { yPercent: -(100 * index / panels.length) });
          if (progressFill) gsap.set(progressFill, { scaleX: index / (panels.length - 1) });
        });
      }, { threshold: 0.35 });
      panels.forEach((panel) => activeObserver.observe(panel));
      dots.forEach((dot) => dot.addEventListener('click', () => {
        panels[Number(dot.dataset.storyDot)]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }));
      return () => { activeObserver.disconnect(); story.classList.remove('is-stacked'); };
    });

    storyMedia.add('(prefers-reduced-motion: reduce)', () => {
      story.classList.add('is-stacked');
      gsap.set(panels, { clearProps: 'all', autoAlpha: 1, y: 0 });
      gsap.set(nameWordNodes.flat(), { clearProps: 'all', autoAlpha: 1, y: 0 });
      gsap.set(commandCharNodes.flat(), { clearProps: 'all', autoAlpha: 1 });
      gsap.set(resultNodes, { clearProps: 'all', autoAlpha: 1, y: 0 });
      panels.forEach((panel) => panel.setAttribute('aria-hidden', 'false'));
      setActiveStoryStep(0, false);
      if (progressFill) gsap.set(progressFill, { scaleX: 0 });
    });
  }

  if (pageRail) {
    const targets = [
      ['#modules', 'Bot suite'], ['#reviews-gallery', 'Reviews'], ['#founder-note', 'Why I built this'],
      ['#see-it-work', 'Walkthrough'], ['.compare-section', 'Comparison'], ['#bot-suite', 'The Aurex suite'],
      ['#why-story', 'Why Aurex'], ['#connect', 'Get started']
    ].map(([selector, label]) => ({ element: document.querySelector(selector), label })).filter((item) => item.element);
    const dotsHost = pageRail.querySelector('[data-page-scroll-dots]');
    const railDots = targets.map(({label}, index) => {
      const dot = document.createElement('span');
      dot.className = 'page-scroll-rail-dot';
      dot.dataset.pageRailDot = String(index);
      dot.setAttribute('role', 'img');
      dot.setAttribute('aria-label', label);
      dotsHost.append(dot);
      return dot;
    });
    const railFill = pageRail.querySelector('[data-page-scroll-fill]');
    let railFrame = 0;
    const updatePageRail = () => {
      railFrame = 0;
      if (!targets.length) return;
      const scrollY = window.scrollY;
      const markerY = window.innerHeight * 0.5;
      const firstRect = targets[0].element.getBoundingClientRect();
      const lastRect = targets[targets.length - 1].element.getBoundingClientRect();
      const rangeStart = firstRect.top + scrollY - markerY;
      const rangeEnd = lastRect.bottom + scrollY - markerY;
      const progress = Math.max(0, Math.min(1, (scrollY - rangeStart) / Math.max(1, rangeEnd - rangeStart)));
      pageRail.classList.toggle('is-visible', scrollY >= rangeStart && scrollY <= rangeEnd);
      if (railFill) railFill.style.transform = `scaleY(${progress})`;
      let active = 0;
      targets.forEach(({element}, index) => {
        if (element.getBoundingClientRect().top <= markerY) active = index;
      });
      railDots.forEach((dot, index) => dot.classList.toggle('is-active', index === active));
    };
    const requestPageRailUpdate = () => { if (!railFrame) railFrame = window.requestAnimationFrame(updatePageRail); };
    window.addEventListener('scroll', requestPageRailUpdate, { passive: true });
    window.addEventListener('resize', requestPageRailUpdate, { passive: true });
    if ('ResizeObserver' in window) {
      const railResizeObserver = new ResizeObserver(requestPageRailUpdate);
      railResizeObserver.observe(document.querySelector('.page-shell') || document.body);
    }
    requestPageRailUpdate();
  }
}

function initFounderNote() {
  const note = document.querySelector('#founder-note');
  if (!note) return;
  const body = note.querySelector('.founder-note-body');
  const paragraphs = [...note.querySelectorAll('[data-founder-note-paragraph]')];
  const line = note.querySelector('[data-founder-note-line]');
  if (!body) return;
  const motionPreference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let animationFrame = 0;
  const showAll = () => {
    paragraphs.forEach((paragraph) => {
      paragraph.style.opacity = '1';
      paragraph.style.visibility = 'visible';
      paragraph.style.transform = 'none';
    });
    if (line) line.style.transform = 'scaleY(1)';
  };
  const update = () => {
    animationFrame = 0;
    if (motionPreference?.matches) { showAll(); return; }
    const rect = body.getBoundingClientRect();
    const scrollY = window.scrollY;
    const start = rect.top + scrollY - window.innerHeight * 0.78;
    const end = rect.bottom + scrollY - window.innerHeight * 0.42;
    const progress = Math.max(0, Math.min(1, (scrollY - start) / Math.max(1, end - start)));
    if (line) line.style.transform = `scaleY(${progress.toFixed(4)})`;
    paragraphs.forEach((paragraph, index) => {
      const revealStart = 0.06 + index * 0.23;
      const revealProgress = Math.max(0, Math.min(1, (progress - revealStart) / 0.2));
      const eased = 1 - (1 - revealProgress) ** 2;
      paragraph.style.opacity = eased.toFixed(4);
      paragraph.style.visibility = revealProgress > 0 ? 'visible' : 'hidden';
      paragraph.style.transform = `translate3d(0, ${(18 * (1 - eased)).toFixed(2)}px, 0)`;
    });
  };
  const requestUpdate = () => { if (!animationFrame) animationFrame = window.requestAnimationFrame(update); };
  if (motionPreference?.matches) showAll(); else requestUpdate();
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  window.addEventListener('load', requestUpdate, { once: true });
  motionPreference?.addEventListener?.('change', requestUpdate);
  if ('ResizeObserver' in window) {
    const noteObserver = new ResizeObserver(requestUpdate);
    noteObserver.observe(note);
  }
}
initFounderNote();

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

const rotatorLines = [...document.querySelectorAll('.hero-rotator-line')];
let rotatorIndex = 0;
let rotatorTimer;
const rotateHeroLine = () => {
  if (!rotatorLines.length) return;
  const outgoing = rotatorLines[rotatorIndex];
  outgoing.classList.remove('is-active');
  outgoing.classList.add('is-leaving');
  rotatorIndex = (rotatorIndex + 1) % rotatorLines.length;
  const incoming = rotatorLines[rotatorIndex];
  incoming.classList.add('is-active');
  window.setTimeout(() => outgoing.classList.remove('is-leaving'), 650);
};
const startHeroRotator = () => { if (!rotatorTimer && rotatorLines.length > 1) rotatorTimer = window.setInterval(rotateHeroLine, 3000); };
const stopHeroRotator = () => { if (rotatorTimer) { window.clearInterval(rotatorTimer); rotatorTimer = null; } };
const heroRotator = document.querySelector('.hero-rotator');
heroRotator?.addEventListener('mouseenter', stopHeroRotator);
heroRotator?.addEventListener('mouseleave', startHeroRotator);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopHeroRotator(); else startHeroRotator();
});
startHeroRotator();

const statNodes = [...document.querySelectorAll('[data-stat-target]')];
const animateStats = () => {
  statNodes.forEach((node, index) => {
    const target = Number(node.dataset.statTarget || node.textContent || 0);
    if (reduceMotion) { node.textContent = String(target); return; }
    const start = performance.now();
    const duration = 1400;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      node.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) window.requestAnimationFrame(tick);
    };
    window.setTimeout(() => window.requestAnimationFrame(tick), index * 90);
  });
};
const statsStrip = document.querySelector('.stats-strip');
if (statsStrip && 'IntersectionObserver' in window) {
  const statsObserver = new IntersectionObserver((entries, observer) => {
    if (entries.some((entry) => entry.isIntersecting)) { animateStats(); observer.disconnect(); }
  }, { threshold: 0.25 });
  statsObserver.observe(statsStrip);
} else animateStats();

const productDemo = document.querySelector('[data-product-demo]');
if (productDemo) {
  const demoWindow = productDemo.querySelector('[data-demo-window]');
  const views = [...productDemo.querySelectorAll('[data-demo-view]')];
  const viewByName = Object.fromEntries(views.map((view) => [view.dataset.demoView, view]));
  const stepLabels = [...productDemo.querySelectorAll('[data-demo-step-label]')];
  const progressBar = productDemo.querySelector('.product-demo-progress');
  const progressFill = productDemo.querySelector('[data-demo-progress-fill]');
  const cursor = productDemo.querySelector('[data-demo-cursor]');
  const addButton = productDemo.querySelector('[data-demo-add]');
  const musicChip = productDemo.querySelector('[data-demo-music-chip]');
  const permissionChecks = [...productDemo.querySelectorAll('[data-demo-permission-check]')];
  const authorizedStatus = productDemo.querySelector('[data-demo-authorized]');
  const roleButton = productDemo.querySelector('[data-demo-role-button]');
  const roleValue = productDemo.querySelector('[data-demo-role-value]');
  const roleMenu = productDemo.querySelector('[data-demo-role-menu]');
  const roleOption = productDemo.querySelector('[data-demo-role-option]');
  const volumeSlider = productDemo.querySelector('[data-demo-slider]');
  const volumeFill = productDemo.querySelector('[data-demo-volume-fill]');
  const volumeThumb = productDemo.querySelector('[data-demo-volume-thumb]');
  const volumeValue = productDemo.querySelector('[data-demo-volume-value]');
  const autoLeave = productDemo.querySelector('[data-demo-auto-leave]');
  const typedCommand = productDemo.querySelector('[data-demo-typed]');
  const inputPlaceholder = productDemo.querySelector('[data-demo-placeholder]');
  const userMessage = productDemo.querySelector('[data-demo-user-message]');
  const userCommand = productDemo.querySelector('[data-demo-user-command]');
  const botReply = productDemo.querySelector('[data-demo-reply]');
  const trackFill = productDemo.querySelector('[data-demo-track-fill]');
  const equalizer = productDemo.querySelector('[data-demo-equalizer]');
  const replayButton = productDemo.querySelector('[data-demo-replay]');
  const reducedMotionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');

  const setActiveStep = (index) => {
    stepLabels.forEach((label, stepIndex) => {
      const active = stepIndex === index;
      label.classList.toggle('is-current', active);
      if (active) label.setAttribute('aria-current', 'step');
      else label.removeAttribute('aria-current');
    });
  };
  const setViewAccessibility = (name) => {
    views.forEach((view) => view.setAttribute('aria-hidden', String(view.dataset.demoView !== name)));
  };
  const showFinalDemo = () => {
    views.forEach((view) => {
      const visible = view.dataset.demoView === 'configure';
      view.style.opacity = visible ? '1' : '0';
      view.style.visibility = visible ? 'visible' : 'hidden';
      view.style.transform = 'none';
    });
    setViewAccessibility('configure');
    setActiveStep(3);
    progressFill.style.transform = 'scaleX(1)';
    progressBar.setAttribute('aria-valuenow', '100');
    addButton.textContent = 'Added ✓';
    addButton.classList.add('is-added');
    musicChip.style.opacity = '1';
    musicChip.style.visibility = 'visible';
    permissionChecks.forEach((check) => { check.classList.add('is-checked'); check.style.opacity = '1'; check.style.visibility = 'visible'; });
    authorizedStatus.style.opacity = '1';
    authorizedStatus.style.visibility = 'visible';
    roleValue.textContent = '@DJ';
    roleMenu.style.opacity = '0';
    roleMenu.style.visibility = 'hidden';
    volumeFill.style.transform = 'scaleX(.7)';
    volumeThumb.style.left = '70%';
    volumeValue.textContent = '70%';
    autoLeave.classList.add('is-on');
    autoLeave.setAttribute('aria-checked', 'true');
    typedCommand.textContent = '';
    inputPlaceholder.style.display = '';
    userCommand.textContent = '/play midnight mix';
    userMessage.style.opacity = '1';
    userMessage.style.visibility = 'visible';
    userMessage.style.transform = 'none';
    userMessage.setAttribute('aria-hidden', 'false');
    botReply.style.opacity = '1';
    botReply.style.visibility = 'visible';
    botReply.style.transform = 'none';
    botReply.setAttribute('aria-hidden', 'false');
    trackFill.style.transform = 'scaleX(.62)';
    equalizer.classList.add('is-playing');
    cursor.style.display = 'none';
  };

  if (reducedMotionQuery?.matches || !window.gsap) {
    showFinalDemo();
  } else {
    const gsapApi = window.gsap;
    const cycleDuration = 18;
    const stepDuration = cycleDuration / 4;
    const command = '/play midnight mix';
    const getPoint = (element, xRatio = .5, yRatio = .5) => {
      const target = typeof element === 'string' ? demoWindow.querySelector(element) : element;
      const targetRect = target.getBoundingClientRect();
      const windowRect = demoWindow.getBoundingClientRect();
      return { x: targetRect.left - windowRect.left + targetRect.width * xRatio, y: targetRect.top - windowRect.top + targetRect.height * yRatio };
    };
    const moveCursor = (timeline, target, at, duration = .58, xRatio = .5, yRatio = .5) => {
      const point = getPoint(target, xRatio, yRatio);
      timeline.to(cursor, { x: point.x, y: point.y, duration, ease: 'power2.inOut' }, at);
    };
    const clickCursor = (timeline, at) => {
      timeline.to(cursor, { scale: .82, duration: .11, ease: 'power1.in' }, at);
      timeline.to(cursor, { scale: 1, duration: .16, ease: 'back.out(2)' }, at + .11);
    };
    const productDemoSteps = [
      {
        label: 'Add', view: 'add',
        animate(timeline, at) {
          moveCursor(timeline, addButton, at + .32, .62, .68, .55);
          clickCursor(timeline, at + 1.03);
          timeline.call(() => { addButton.textContent = 'Added ✓'; addButton.classList.add('is-added'); }, [], at + 1.28);
          timeline.to(musicChip, { autoAlpha: 1, y: 0, duration: .32, ease: 'power2.out' }, at + 1.28);
        }
      },
      {
        label: 'Authorize', view: 'authorize',
        animate(timeline, at) {
          moveCursor(timeline, productDemo.querySelector('[data-demo-authorize]'), at + .48, .58, .62, .54);
          clickCursor(timeline, at + 1.12);
          permissionChecks.forEach((check, index) => {
            timeline.to(check, { autoAlpha: 1, scale: 1, duration: .2, ease: 'back.out(2)' }, at + 1.5 + index * .38);
          });
          timeline.to(authorizedStatus, { autoAlpha: 1, duration: .28, ease: 'power1.out' }, at + 2.85);
        }
      },
      {
        label: 'Configure', view: 'configure',
        animate(timeline, at) {
          moveCursor(timeline, roleButton, at + .42, .48, .76, .55);
          clickCursor(timeline, at + .93);
          timeline.to(roleMenu, { autoAlpha: 1, y: 0, duration: .2, ease: 'power1.out' }, at + .94);
          moveCursor(timeline, roleOption, at + 1.18, .34, .42, .5);
          clickCursor(timeline, at + 1.58);
          timeline.call(() => { roleValue.textContent = '@DJ'; }, [], at + 1.7);
          timeline.to(roleMenu, { autoAlpha: 0, y: -3, duration: .18 }, at + 1.72);
          moveCursor(timeline, volumeSlider, at + 2.02, .48, .7, .5);
          timeline.to(volumeFill, { scaleX: .7, duration: .52, ease: 'power2.out' }, at + 2.28);
          timeline.to(volumeThumb, { left: '70%', duration: .52, ease: 'power2.out' }, at + 2.28);
          timeline.call(() => { volumeValue.textContent = '70%'; }, [], at + 2.82);
          moveCursor(timeline, autoLeave, at + 3.06, .42, .55, .5);
          clickCursor(timeline, at + 3.52);
          timeline.call(() => { autoLeave.classList.add('is-on'); autoLeave.setAttribute('aria-checked', 'true'); }, [], at + 3.78);
        }
      },
      {
        label: 'Use', view: 'configure',
        animate(timeline, at) {
          const chatInput = productDemo.querySelector('.product-demo-message-box');
          moveCursor(timeline, chatInput, at + .14, .48, .57, .5);
          clickCursor(timeline, at + .62);
          const typing = { count: 0 };
          timeline.to(typing, {
            count: command.length, duration: 1.08, ease: 'none', roundProps: 'count',
            onStart: () => { inputPlaceholder.style.display = 'none'; },
            onUpdate: () => { typedCommand.textContent = command.slice(0, Math.round(typing.count)); }
          }, at + .76);
          timeline.call(() => {
            userCommand.textContent = command;
            userMessage.setAttribute('aria-hidden', 'false');
            typedCommand.textContent = '';
            inputPlaceholder.style.display = '';
          }, [], at + 1.92);
          timeline.to(userMessage, { autoAlpha: 1, y: 0, duration: .22, ease: 'power1.out' }, at + 1.92);
          timeline.call(() => { botReply.setAttribute('aria-hidden', 'false'); equalizer.classList.add('is-playing'); }, [], at + 2.16);
          timeline.to(botReply, { autoAlpha: 1, y: 0, duration: .3, ease: 'power2.out' }, at + 2.16);
          timeline.to(trackFill, { scaleX: .62, duration: 2.35, ease: 'none' }, at + 2.28);
        }
      }
    ];

    let timeline = null;
    let isInView = false;
    let isHovered = false;
    let isTouching = false;
    let hasFocus = false;
    let resizeFrame = 0;
    const resetDemo = () => {
      addButton.textContent = 'Add Music to server';
      addButton.classList.remove('is-added');
      roleValue.textContent = 'Select a role';
      volumeValue.textContent = '0%';
      autoLeave.classList.remove('is-on');
      autoLeave.setAttribute('aria-checked', 'false');
      typedCommand.textContent = '';
      inputPlaceholder.style.display = '';
      userCommand.textContent = '';
      userMessage.setAttribute('aria-hidden', 'true');
      botReply.setAttribute('aria-hidden', 'true');
      equalizer.classList.remove('is-playing');
      progressBar.setAttribute('aria-valuenow', '0');
      setActiveStep(0);
      setViewAccessibility('add');
    };
    const syncPlayback = () => {
      if (!timeline) return;
      if (isInView && !isHovered && !isTouching && !hasFocus && !document.hidden) timeline.play();
      else timeline.pause();
    };
    const buildTimeline = () => {
      if (timeline) timeline.kill();
      timeline = gsapApi.timeline({ paused: true, repeat: -1, repeatDelay: 0 });
      timeline.call(resetDemo, [], 0);
      timeline.set(views, { autoAlpha: 0, y: 8 }, 0);
      timeline.set(viewByName.add, { autoAlpha: 1, y: 0 }, 0);
      timeline.set(musicChip, { autoAlpha: 0, y: 3 }, 0);
      timeline.set(permissionChecks, { autoAlpha: 0, scale: .65 }, 0);
      timeline.set(authorizedStatus, { autoAlpha: 0 }, 0);
      timeline.set(roleMenu, { autoAlpha: 0, y: -3 }, 0);
      timeline.set(volumeFill, { scaleX: 0, transformOrigin: 'left center' }, 0);
      timeline.set(volumeThumb, { left: '0%' }, 0);
      timeline.set([userMessage, botReply], { autoAlpha: 0, y: 8 }, 0);
      timeline.set(trackFill, { scaleX: 0, transformOrigin: 'left center' }, 0);
      timeline.set(cursor, { x: 45, y: 62, scale: 1, autoAlpha: 1 }, 0);
      timeline.fromTo(progressFill, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: cycleDuration, ease: 'none' }, 0);
      let previousView = 'add';
      productDemoSteps.forEach((step, index) => {
        const at = index * stepDuration;
        timeline.call(() => setActiveStep(index), [], at);
        if (step.view !== previousView) {
          timeline.to(viewByName[previousView], { autoAlpha: 0, y: -5, duration: .22, ease: 'power1.in' }, at);
          timeline.to(viewByName[step.view], { autoAlpha: 1, y: 0, duration: .3, ease: 'power2.out' }, at + .12);
          timeline.call(() => setViewAccessibility(step.view), [], at + .12);
        }
        previousView = step.view;
        step.animate(timeline, at);
      });
      timeline.eventCallback('onUpdate', () => progressBar.setAttribute('aria-valuenow', String(Math.round(timeline.progress() * 100))));
    };
    buildTimeline();
    const demoObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
      isInView = entries.some((entry) => entry.isIntersecting);
      syncPlayback();
    }, { threshold: .16 }) : null;
    if (demoObserver) demoObserver.observe(demoWindow);
    else isInView = true;
    if (window.matchMedia('(hover: hover)').matches) {
      demoWindow.addEventListener('pointerenter', (event) => { if (event.pointerType === 'mouse') { isHovered = true; syncPlayback(); } });
      demoWindow.addEventListener('pointerleave', (event) => { if (event.pointerType === 'mouse') { isHovered = false; syncPlayback(); } });
    }
    [demoWindow, replayButton].forEach((node) => {
      node.addEventListener('touchstart', () => { isTouching = true; syncPlayback(); }, { passive: true });
      node.addEventListener('touchend', () => { isTouching = false; syncPlayback(); }, { passive: true });
      node.addEventListener('touchcancel', () => { isTouching = false; syncPlayback(); }, { passive: true });
    });
    demoWindow.addEventListener('focusin', () => { hasFocus = true; syncPlayback(); });
    demoWindow.addEventListener('focusout', (event) => {
      if (!demoWindow.contains(event.relatedTarget)) { hasFocus = false; syncPlayback(); }
    });
    replayButton.addEventListener('click', () => {
      if (!timeline) return;
      timeline.pause(0);
      resetDemo();
      timeline.play(0);
      syncPlayback();
    });
    document.addEventListener('visibilitychange', syncPlayback);
    window.addEventListener('resize', () => {
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => { resizeFrame = 0; buildTimeline(); syncPlayback(); });
    }, { passive: true });
    syncPlayback();
  }
}


function initComparisonBento() {
  const comparison = document.querySelector('[data-compare-section]');
  const bento = document.querySelector('.stats-footer.bento-grid');
  if (!comparison || !bento) return;

  const rows = [...comparison.querySelectorAll('[data-compare-row]')];
  const tiles = [...bento.querySelectorAll('[data-stat-tile]')];
  const countNodes = [...bento.querySelectorAll('[data-bento-count]')];
  const setFinalCounts = () => countNodes.forEach((node) => {
    node.textContent = String(Number(node.dataset.bentoCount));
  });
  const revealEverything = () => {
    rows.forEach((row) => row.classList.add('is-visible'));
    tiles.forEach((tile) => tile.classList.add('is-revealed'));
    setFinalCounts();
  };

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEverything();
  } else {
    comparison.classList.add('has-scroll-reveal');
    bento.classList.add('has-scroll-motion');
    countNodes.forEach((node) => { node.textContent = '0'; });

    const rowObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -5% 0px' });
    rows.forEach((row) => rowObserver.observe(row));

    const countUp = (node) => {
      const target = Number(node.dataset.bentoCount);
      const start = performance.now();
      const duration = 900;
      const tick = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        node.textContent = String(Math.round(target * eased));
        if (progress < 1) window.requestAnimationFrame(tick);
      };
      window.requestAnimationFrame(tick);
    };
    const tileObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const tile = entry.target;
        tile.classList.add('is-revealed');
        const count = tile.querySelector('[data-bento-count]');
        if (count) countUp(count);
        observer.unobserve(tile);
      });
    }, { threshold: 0.22, rootMargin: '0px 0px -28px 0px' });
    tiles.forEach((tile) => tileObserver.observe(tile));
  }

  tiles.forEach((tile) => {
    tile.addEventListener('pointermove', (event) => {
      if (event.pointerType && event.pointerType !== 'mouse') return;
      const rect = tile.getBoundingClientRect();
      tile.style.setProperty('--spot-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
      tile.style.setProperty('--spot-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
    }, { passive: true });
  });
}

initComparisonBento();
