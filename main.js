const botData = {
  music: {
    icon: 'fa-headphones',
    label: 'MUSIC / NOW PLAYING',
    title: 'Keep the room moving.',
    description: 'Queue the energy, skip the clutter, and make every voice channel feel alive.',
    command: ['/play', 'your vibe']
  },
  security: {
    icon: 'fa-shield-halved',
    label: 'SECURITY / LOCKED IN',
    title: 'Calm is a feature.',
    description: 'Automod, verification, and audit signals that keep chaos outside the server.',
    command: ['/secure', 'the room']
  },
  greet: {
    icon: 'fa-hand-sparkles',
    label: 'GREET / FIRST IMPRESSION',
    title: 'Make joining feel human.',
    description: 'Welcome every new member with the tone, roles, and context your community deserves.',
    command: ['/welcome', 'a member']
  },
  ping: {
    icon: 'fa-bolt',
    label: 'PING / INSTANT SIGNAL',
    title: 'Say it once. Reach everyone.',
    description: 'Route the right alert to the right people without turning your server into noise.',
    command: ['/ping', 'your crew']
  },
  ticket: {
    icon: 'fa-ticket',
    label: 'TICKET / HELP DESK',
    title: 'Support, without the queue.',
    description: 'Give questions a place to land and your team a cleaner way to answer them.',
    command: ['/ticket', 'open a line']
  },
  level: {
    icon: 'fa-chart-line',
    label: 'LEVEL / MOMENTUM',
    title: 'Turn activity into status.',
    description: 'Reward the people who make the community worth coming back to every day.',
    command: ['/level', 'up the room']
  }
};

const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');
const closeTargets = document.querySelectorAll('[data-menu-close], .mobile-link, .mobile-connect');
const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
const bgVideo = document.querySelector('.bg-video');

if (bgVideo) {
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

const readoutIcon = document.querySelector('#readout-icon i');
const readoutLabel = document.querySelector('#readout-label');
const readoutTitle = document.querySelector('#readout-title');
const readoutDescription = document.querySelector('#readout-description');
const readoutCommand = document.querySelector('#readout-command');
const botTabs = document.querySelectorAll('.bot-tab');

function renderBot(key) {
  const bot = botData[key];
  if (!bot) return;
  botTabs.forEach((tab) => {
    const selected = tab.dataset.bot === key;
    tab.classList.toggle('is-selected', selected);
    tab.setAttribute('aria-selected', String(selected));
  });
  readoutIcon?.classList.remove(...Array.from(readoutIcon.classList).filter((name) => name.startsWith('fa-') && name !== 'fa-solid'));
  if (readoutIcon) readoutIcon.classList.add(bot.icon);
  if (readoutLabel) readoutLabel.textContent = bot.label;
  if (readoutTitle) readoutTitle.textContent = bot.title;
  if (readoutDescription) readoutDescription.textContent = bot.description;
  if (readoutCommand) {
    readoutCommand.innerHTML = `${bot.command[0]} <b>${bot.command[1]}</b>`;
  }
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
