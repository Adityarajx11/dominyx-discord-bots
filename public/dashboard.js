const moduleUi = {
  music: {
    name: 'Music',
    icon: 'fa-headphones',
    description: 'Control voice playback, queue behaviour, DJ permissions, and the music XP economy.',
    fields: [
      { key: 'stay247', label: '24/7 MODE' },
      { key: 'defaultVolume', label: 'DEFAULT VOLUME', suffix: '%' },
      { key: 'djRoleId', label: 'DJ ROLE', render: 'role', placeholder: 'Optional role' },
      { key: 'maxQueue', label: 'MAX QUEUE SIZE' },
      { key: 'leaveTimeoutMinutes', label: 'LEAVE TIMEOUT', suffix: 'min' },
      { key: 'announceChannelId', label: 'ANNOUNCE CHANNEL', render: 'channel', channelTypes: [0, 5, 15, 16] },
      { key: 'prefix', label: 'COMMAND PREFIX', placeholder: '!' },
      { key: 'xpEnabled', label: 'MUSIC XP' },
      { key: 'xpCooldownSec', label: 'XP COOLDOWN', suffix: 'sec' },
    ],
  },
  guard: {
    name: 'Security',
    icon: 'fa-shield-halved',
    description: 'Moderation defence: anti-raid, anti-nuke, spam filters, lockdown support, and warn escalation.',
    fields: [
      { key: 'modlogChannelId', label: 'MOD-LOG CHANNEL', render: 'channel', channelTypes: [0, 5, 15, 16] },
      { key: 'automodSpam', label: 'SPAM BLOCK' },
      { key: 'spamThreshold', label: 'SPAM MESSAGES' },
      { key: 'spamSeconds', label: 'SPAM WINDOW', suffix: 'sec' },
      { key: 'automodLinks', label: 'LINK BLOCK' },
      { key: 'automodCaps', label: 'CAPS BLOCK' },
      { key: 'capsThreshold', label: 'CAPS THRESHOLD', suffix: '%' },
      { key: 'automodMentions', label: 'MENTION BLOCK' },
      { key: 'mentionThreshold', label: 'MAX MENTIONS' },
      { key: 'automodEmoji', label: 'EMOJI BLOCK' },
      { key: 'emojiThreshold', label: 'MAX EMOJIS' },
      { key: 'automodWords', label: 'BAD-WORD BLOCK' },
      { key: 'badWords', label: 'BLOCKED WORDS', render: 'list', placeholder: 'One word or phrase per line' },
      { key: 'scamLinks', label: 'SCAM / PHISHING LINKS' },
      { key: 'raidEnabled', label: 'ANTI-RAID' },
      { key: 'raidJoins', label: 'RAID JOINS' },
      { key: 'raidSeconds', label: 'RAID WINDOW', suffix: 'sec' },
      { key: 'raidAction', label: 'RAID ACTION' },
      { key: 'raidCooldownMinutes', label: 'RAID COOLDOWN', suffix: 'min' },
      { key: 'minAccountAgeDays', label: 'MIN ACCOUNT AGE', suffix: 'days' },
      { key: 'ageAction', label: 'AGE-GATE ACTION' },
      { key: 'antinukeEnabled', label: 'ANTI-NUKE' },
      { key: 'nukeAction', label: 'NUKER ACTION' },
      { key: 'nukeRollback', label: 'ROLL BACK DELETIONS' },
      { key: 'muteRoleId', label: 'AUTOMOD MUTE ROLE', render: 'role', placeholder: 'Optional role' },
      { key: 'warnsMute', label: 'WARNINGS TO MUTE' },
      { key: 'warnsBan', label: 'WARNINGS TO BAN' },
      { key: 'selfRoleCategories', label: 'JOIN-TO-GET ROLES', render: 'json', placeholder: '{ "Colour": ["ROLE_ID"] }' },
    ],
  },
  greet: {
    name: 'Greet',
    icon: 'fa-hand-sparkles',
    description: 'Shape the first impression with a welcome channel, message, card theme, and auto-role.',
    fields: [
      { key: 'welcomeChannelId', label: 'WELCOME CHANNEL', render: 'channel', channelTypes: [0, 5, 15, 16] },
      { key: 'welcomeMessage', label: 'WELCOME MESSAGE', render: 'textarea', placeholder: 'Welcome to {server}, {user}.' },
      { key: 'autoRoleId', label: 'AUTO ROLE', render: 'role', placeholder: 'Optional role' },
      { key: 'cardEnabled', label: 'WELCOME CARDS' },
      { key: 'cardTheme', label: 'CARD THEME' },
      { key: 'goodbyeChannelId', label: 'GOODBYE CHANNEL', render: 'channel', channelTypes: [0, 5, 15, 16] },
      { key: 'goodbyeMessage', label: 'GOODBYE MESSAGE', render: 'textarea', placeholder: '{user} just left {server}.' },
      { key: 'dmWelcome', label: 'DM WELCOME' },
      { key: 'greetBots', label: 'GREET BOTS' },
    ],
  },
  ping: {
    name: 'Ping',
    icon: 'fa-bolt',
    description: 'Route live alerts and announcements to the people who need them.',
    fields: [
      { key: 'youtubeChannelId', label: 'YOUTUBE CHANNEL ID', placeholder: 'UC…' },
      { key: 'alertChannelId', label: 'ALERT CHANNEL', render: 'channel', channelTypes: [0, 5, 15, 16] },
      { key: 'alertMessage', label: 'ALERT MESSAGE', render: 'textarea', placeholder: '{user} just went live!' },
      { key: 'mentionRoleId', label: 'MENTION ROLE', render: 'role', placeholder: 'Optional role' },
      { key: 'pollMinutes', label: 'POLL INTERVAL', suffix: 'min' },
    ],
  },
  ticket: {
    name: 'Ticket',
    icon: 'fa-ticket',
    description: 'Configure the support panel, staff roles, ticket limits, and inactivity handling.',
    fields: [
      { key: 'categoryChannelId', label: 'TICKET CATEGORY', render: 'channel', channelTypes: [4] },
      { key: 'logChannelId', label: 'TRANSCRIPT LOG', render: 'channel', channelTypes: [0, 5, 15, 16] },
      { key: 'staffRoleId', label: 'STAFF ROLE', render: 'role' },
      { key: 'maxTickets', label: 'MAX TICKETS PER MEMBER' },
      { key: 'inactiveCloseHours', label: 'INACTIVE CLOSE', suffix: 'hours' },
      { key: 'dmClose', label: 'DM ON CLOSE' },
      { key: 'panelTitle', label: 'PANEL TITLE' },
      { key: 'panelRules', label: 'PANEL RULES', render: 'textarea' },
      { key: 'bannerUrl', label: 'BANNER URL', placeholder: 'https://…' },
    ],
  },
  level: {
    name: 'Level',
    icon: 'fa-chart-line',
    description: 'Shape XP progression, level-up messages, role rewards, and leaderboard behaviour.',
    fields: [
      { key: 'channelId', label: 'LEVEL-UP CHANNEL', render: 'channel', channelTypes: [0, 5, 15, 16] },
      { key: 'messageTemplate', label: 'LEVEL-UP MESSAGE', render: 'textarea', placeholder: '{user} reached level {level}!' },
      { key: 'xpMin', label: 'MIN XP PER MESSAGE' },
      { key: 'xpMax', label: 'MAX XP PER MESSAGE' },
      { key: 'cooldownSeconds', label: 'XP COOLDOWN', suffix: 'sec' },
      { key: 'roleStack', label: 'STACK LEVEL ROLES' },
      { key: 'ignoredChannels', label: 'IGNORED CHANNELS', render: 'list', placeholder: 'One channel ID per line' },
      { key: 'ignoredRoles', label: 'IGNORED ROLES', render: 'list', placeholder: 'One role ID per line' },
    ],
  },
};

const state = { user: null, guilds: [], guildId: null, selectedBot: 'music', settings: {}, modules: {}, channels: [], roles: [], csrf: null };

const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character],
  );

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: { 'content-type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || data.error || `Request failed (${response.status})`);
    error.code = data.error;
    error.fields = data.fields;
    throw error;
  }
  return data;
}

function avatarUrl(user) {
  return user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64` : '';
}
function initials(text) {
  return (text || 'D')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

const ERROR_MESSAGES = {
  oauth_not_configured: 'Secure setup is pending. Add the Discord OAuth values in the project input card before signing in.',
  access_denied: 'Discord login was cancelled.',
  invalid_oauth_state: 'The login session expired. Please try signing in again.',
  not_authenticated: 'Your session expired. Please sign in again.',
  guild_forbidden: 'You do not have permission to manage this Discord server.',
  database_not_configured: 'DATABASE_URL is not set on the server, so module settings cannot be loaded.',
  origin_rejected: 'The request origin was rejected. Reload the dashboard and try again.',
  csrf_failed: 'Security token mismatch. Reload the dashboard and try again.',
  rate_limited: 'Too many requests. Wait a moment and try again.',
  oauth_invalid_client:
    'Discord rejected the sign-in because the application secret no longer matches. The Discord application secret was rotated and needs to be updated on the server.',
  oauth_redirect_mismatch:
    'Discord rejected the sign-in because this address is not registered as a redirect. Add it to the Discord application under OAuth2 → Redirects.',
  oauth_code_rejected: 'That sign-in link was already used. Please start the sign-in again.',
  oauth_code_expired: 'That sign-in link expired. Please start the sign-in again.',
  oauth_failed: 'Discord sign-in failed. Please try again, and tell the owner if it keeps happening.',
};

// Each error gets a short explanation and, where the fix is on the server,
// the exact thing that has to change.
const ERROR_DETAILS = {
  oauth_invalid_client: {
    title: 'Discord rejected the sign-in',
    body:
      'Your Discord login worked, but the server could not prove it owns the Discord application, so the sign-in was refused.',
    foot:
      'The application secret was rotated on Discord. Reset it in the Discord Developer Portal, then update <code>DISCORD_CLIENT_SECRET</code> on the server.',
  },
  oauth_redirect_mismatch: {
    title: 'This address is not a registered redirect',
    body:
      'Discord refused the sign-in because the address it sent the user back to is not listed for the application.',
    foot: 'Add <code>' + window.location.origin + '/api/auth/callback</code> under Discord Developer Portal → OAuth2 → Redirects.',
  },
  oauth_code_rejected: {
    title: 'That sign-in link was already used',
    body: 'Each Discord authorisation code works only once. The link was opened twice, so the second attempt was rejected.',
    foot: 'Use the Login with Discord button above to start a fresh sign-in.',
  },
  oauth_code_expired: {
    title: 'That sign-in link expired',
    body: 'Discord authorisation codes are short lived. This one expired before it was used.',
    foot: 'Use the Login with Discord button above to start a fresh sign-in.',
  },
  oauth_failed: {
    title: 'Discord sign-in failed',
    body: 'Something went wrong while completing the sign-in. It usually clears with a second attempt.',
    foot: 'Use the Login with Discord button above to try again.',
  },
  access_denied: {
    title: 'Sign-in was cancelled',
    body: 'The Discord authorisation was declined, so no session was created.',
    foot: 'Use the Login with Discord button above whenever you are ready.',
  },
  invalid_oauth_state: {
    title: 'That sign-in attempt expired',
    body: 'The sign-in was started in a different browser or tab, so the security token did not match.',
    foot: 'Use the Login with Discord button above to start a fresh sign-in.',
  },
  oauth_not_configured: {
    title: 'Sign-in is not configured yet',
    body: 'The server is missing the Discord application values, so it cannot start a sign-in.',
    foot: 'Set <code>DISCORD_CLIENT_ID</code>, <code>DISCORD_CLIENT_SECRET</code> and <code>AUREX_SESSION_SECRET</code> on the server.',
  },
};

function showError(message, code) {
  const key = code || message;
  const friendly = ERROR_MESSAGES[key] || ERROR_MESSAGES[message] || message;

  const note = $('#auth-note');
  if (note) {
    note.textContent = friendly;
    note.classList.add('is-error');
  }

  const alert = $('#auth-alert');
  if (alert) {
    const details = ERROR_DETAILS[key];
    if (details) {
      $('#auth-alert-title').textContent = details.title;
      $('#auth-alert-body').textContent = details.body;
      $('#auth-alert-foot').innerHTML = details.foot;
      alert.hidden = false;
    } else {
      alert.hidden = true;
    }
  }

  return friendly;
}

// ---------------------------------------------------------------- rendering

function renderUser() {
  $('#user-chip').hidden = false;
  $('#logout-link').hidden = false;
  $('#user-name').textContent = state.user.global_name || state.user.username;
  const avatar = $('#user-avatar');
  const image = avatarUrl(state.user);
  if (image) avatar.style.backgroundImage = `url(${image})`;
  else avatar.textContent = initials(state.user.global_name || state.user.username);
}

function botBadges(bots) {
  if (!bots) return '';
  return Object.keys(bots)
    .map((key) => {
      const module = moduleUi[key];
      const label = module ? module.name : key;
      return `<span class="bot-badge" title="${escapeHtml(label)}">${escapeHtml(label.slice(0, 1))}</span>`;
    })
    .join('');
}

function renderGuilds() {
  const list = $('#server-list');
  if (!state.guilds.length) {
    list.innerHTML = '<p class="empty-note">No manageable servers found.</p>';
    return;
  }
  list.innerHTML = state.guilds
    .map(
      (guild) => `<button class="server-button ${guild.id === state.guildId ? 'is-selected' : ''}" type="button" data-guild="${escapeHtml(guild.id)}">
        <span class="server-icon" ${guild.icon ? `style="background-image:url(https://cdn.discordapp.com/icons/${escapeHtml(guild.id)}/${escapeHtml(guild.icon)}.png?size=64)"` : ''}>${guild.icon ? '' : escapeHtml(initials(guild.name))}</span>
        <span class="server-name">${escapeHtml(guild.name)}</span>
        <span class="server-badges">${botBadges(guild.bots)}</span>
      </button>`,
    )
    .join('');
  list.querySelectorAll('[data-guild]').forEach((button) =>
    button.addEventListener('click', () => selectGuild(button.dataset.guild)),
  );
}

function renderBotSwitcher() {
  $('#bot-switcher').innerHTML = Object.entries(moduleUi)
    .map(
      ([key, module]) => `<button class="bot-switch ${key === state.selectedBot ? 'is-selected' : ''}" type="button" data-bot="${key}">
        <i class="fa-solid ${module.icon}"></i><span>${escapeHtml(module.name)}</span>
      </button>`,
    )
    .join('');
  $('#bot-switcher')
    .querySelectorAll('[data-bot]')
    .forEach((button) =>
      button.addEventListener('click', () => {
        state.selectedBot = button.dataset.bot;
        renderBotSwitcher();
        renderSettings();
        $('#save-status').textContent = 'Changes are local until you save.';
      }),
    );
}

function fieldMeta(field) {
  return state.modules[state.selectedBot]?.fields?.[field.key] || { type: 'text' };
}

function renderKind(field) {
  if (field.render) return field.render;
  const type = fieldMeta(field).type;
  if (type === 'boolean') return 'boolean';
  if (type === 'integer') return 'number';
  if (type === 'textarea') return 'textarea';
  if (type === 'text-list') return 'list';
  if (type === 'json-object') return 'json';
  if (type === 'enum') return 'enum';
  return 'text';
}

function channelOptions(types) {
  const allowed = types || [0, 1, 2, 5, 13, 15, 16];
  return state.channels.filter((channel) => allowed.includes(channel.type));
}

function selectMarkup(name, options, value, placeholder) {
  const current = value === null || value === undefined ? '' : String(value);
  const body = options
    .map((option) => `<option value="${escapeHtml(option.value)}" ${option.value === current ? 'selected' : ''}>${escapeHtml(option.label)}</option>`)
    .join('');
  return `<div class="field"><label for="setting-${escapeHtml(name)}">${escapeHtml(placeholder)}</label><select id="setting-${escapeHtml(name)}" name="${escapeHtml(name)}"><option value="">Not set</option>${body}</select></div>`;
}

function fieldMarkup(field, values) {
  const value = values?.[field.key];
  const kind = renderKind(field);
  const meta = fieldMeta(field);
  const id = `setting-${field.key}`;
  const label = escapeHtml(field.label);

  if (kind === 'boolean') {
    const selected = value === false ? 'disabled' : 'enabled';
    const options = ['enabled', 'disabled']
      .map((option) => `<option value="${option}" ${option === selected ? 'selected' : ''}>${option.toUpperCase()}</option>`)
      .join('');
    return `<div class="field"><label for="${id}">${label}</label><select id="${id}" name="${field.key}">${options}</select></div>`;
  }

  if (kind === 'enum') {
    const options = (meta.options || [])
      .map((option) => `<option value="${escapeHtml(option)}" ${String(value ?? '') === option ? 'selected' : ''}>${escapeHtml(option.toUpperCase())}</option>`)
      .join('');
    return `<div class="field"><label for="${id}">${label}</label><select id="${id}" name="${field.key}">${options}</select></div>`;
  }

  if (kind === 'role') {
    const options = state.roles.map((role) => ({ value: role.id, label: role.name }));
    return selectMarkup(field.key, options, value, field.label);
  }

  if (kind === 'channel') {
    const options = channelOptions(field.channelTypes).map((channel) => ({ value: channel.id, label: `#${channel.name}` }));
    return selectMarkup(field.key, options, value, field.label);
  }

  if (kind === 'textarea' || kind === 'list' || kind === 'json') {
    let text = '';
    if (kind === 'list') text = Array.isArray(value) ? value.join('\n') : '';
    else if (kind === 'json') text = value && typeof value === 'object' ? JSON.stringify(value, null, 2) : '';
    else text = value ?? '';
    return `<div class="field full"><label for="${id}">${label}</label><textarea id="${id}" name="${field.key}" placeholder="${escapeHtml(field.placeholder || '')}">${escapeHtml(text)}</textarea></div>`;
  }

  const type = kind === 'number' ? 'number' : 'text';
  const bounds =
    kind === 'number'
      ? `${meta.min !== undefined ? ` min="${meta.min}"` : ''}${meta.max !== undefined ? ` max="${meta.max}"` : ''}`
      : '';
  const suffix = field.suffix ? `<span class="field-suffix">${escapeHtml(field.suffix)}</span>` : '';
  return `<div class="field field-has-suffix"><label for="${id}">${label}</label><div class="field-control">${suffix}<input id="${id}" name="${field.key}" type="${type}" value="${escapeHtml(value ?? '')}" placeholder="${escapeHtml(field.placeholder || '')}"${bounds} /></div></div>`;
}

function renderSettings() {
  const module = moduleUi[state.selectedBot];
  const moduleState = state.settings[state.selectedBot] || {};

  $('#settings-kicker').textContent = `MODULE / ${module.name.toUpperCase()}`;
  $('#settings-title').textContent = module.name;
  $('#settings-description').textContent = module.description;
  $('#bot-enabled').checked = moduleState.enabled !== false;
  $('#settings-form').innerHTML = module.fields.map((field) => fieldMarkup(field, moduleState)).join('');
}

// ------------------------------------------------------------------ actions

async function selectGuild(guildId) {
  state.guildId = guildId;
  renderGuilds();

  const guild = state.guilds.find((item) => item.id === guildId);
  $('#server-title').textContent = guild?.name || 'Selected server';
  $('#server-subtitle').textContent = 'Loading module settings…';
  $('#server-status-text').textContent = 'SYNCING';

  try {
    const data = await api(`/api/guilds/${encodeURIComponent(guildId)}/settings`);
    state.settings = data.settings || {};
    state.channels = data.channels || [];
    state.roles = data.roles || [];
    $('#server-subtitle').textContent = data.guild?.name
      ? `Managing ${data.guild.name} — ${Object.keys(data.bots || {}).length} Aurex module(s) active.`
      : 'Configure modules and save changes.';
    $('#server-status-text').textContent = 'CONNECTED';
    renderSettings();
    $('#save-status').textContent = 'Changes are local until you save.';
  } catch (error) {
    state.settings = {};
    state.channels = [];
    state.roles = [];
    $('#server-subtitle').textContent = showError(error.message, error.code);
    $('#server-status-text').textContent = 'OFFLINE';
    renderSettings();
  }
}

// Converts a form value back into the type the API expects.
function serializeValue(meta, raw) {
  switch (meta.type) {
    case 'boolean':
      return raw === 'enabled';
    case 'integer':
      return raw === '' || raw === null ? null : Number(raw);
    case 'text-list':
      return String(raw ?? '')
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);
    case 'json-object':
      try {
        const parsed = JSON.parse(raw || '{}');
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
      } catch {
        return {};
      }
    default:
      return raw === '' ? null : raw;
  }
}

async function saveSettings(event) {
  event.preventDefault();
  if (!state.guildId) return;

  const module = moduleUi[state.selectedBot];
  const metadata = state.modules[state.selectedBot]?.fields || {};
  const form = new FormData(event.currentTarget);
  const values = {};

  for (const field of module.fields) {
    const meta = metadata[field.key];
    if (!meta) continue;
    values[field.key] = serializeValue(meta, form.get(field.key));
  }
  values.enabled = $('#bot-enabled').checked;

  $('#save-status').textContent = 'Saving…';
  $('#save-button').disabled = true;

  try {
    const result = await api(`/api/guilds/${encodeURIComponent(state.guildId)}/settings`, {
      method: 'PUT',
      headers: state.csrf ? { 'x-aurex-csrf': state.csrf } : {},
      body: JSON.stringify({ module: state.selectedBot, values }),
    });
    state.settings[state.selectedBot] = result.settings || {};
    const changed = (result.changes || []).length;
    renderSettings();
    $('#save-status').textContent = changed ? `Saved ${changed} change(s) just now.` : 'Saved — nothing changed.';
  } catch (error) {
    $('#save-status').textContent = showError(error.message, error.code);
  } finally {
    $('#save-button').disabled = false;
  }
}

async function init() {
  const error = new URLSearchParams(location.search).get('error');
  if (error) showError(error);

  try {
    state.modules = await api('/api/modules');
  } catch {
    state.modules = {};
  }

  // The gate stays hidden until the session is known, so a signed-in user never
  // sees the authentication screen flash before the dashboard appears.
  const loading = $('#auth-loading');
  const gate = $('#auth-gate');
  const shell = $('#dashboard-shell');

  try {
    const session = await api('/api/auth/me');

    if (!session.authenticated) {
      if (loading) loading.hidden = true;
      if (gate) gate.hidden = false;
      return;
    }

    state.user = session.user;
    state.csrf = session.csrf;

    if (loading) loading.hidden = true;
    if (gate) gate.hidden = true;
    if (shell) shell.hidden = false;

    renderUser();
    renderBotSwitcher();

    state.guilds = await api('/api/guilds');
    renderGuilds();

    if (state.guilds[0]) await selectGuild(state.guilds[0].id);
    else $('#server-subtitle').textContent = 'No manageable servers found for this Discord account.';
  } catch (err) {
    if (loading) loading.hidden = true;
    if (gate) gate.hidden = false;
    if (shell) shell.hidden = true;
    showError(err.message, err.code);
  }
}

$('#settings-form').addEventListener('submit', saveSettings);
init();
