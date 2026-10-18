const botDefinitions = {
  music: { name: 'Music', icon: 'fa-headphones', description: 'Control voice-channel playback, queues, and music permissions.', fields: [{ key: 'defaultVolume', label: 'DEFAULT VOLUME', type: 'number', placeholder: '80', suffix: '%' }, { key: 'djRoleId', label: 'DJ ROLE ID', placeholder: 'Optional Discord role ID' }] },
  security: { name: 'Security', icon: 'fa-shield-halved', description: 'Tune protection, verification, and moderation behavior.', fields: [{ key: 'antiSpam', label: 'ANTI-SPAM', type: 'select', options: ['enabled', 'disabled'] }, { key: 'verificationLevel', label: 'VERIFICATION', type: 'select', options: ['off', 'low', 'medium', 'high'] }] },
  greet: { name: 'Greet', icon: 'fa-hand-sparkles', description: 'Shape the first impression with a welcome channel, message, and role.', fields: [{ key: 'welcomeChannelId', label: 'WELCOME CHANNEL ID', placeholder: 'Channel ID' }, { key: 'autoRoleId', label: 'AUTO ROLE ID', placeholder: 'Optional role ID' }, { key: 'welcomeMessage', label: 'WELCOME MESSAGE', type: 'textarea', placeholder: 'Welcome to {server}, {user}.' }] },
  ping: { name: 'Ping', icon: 'fa-bolt', description: 'Route announcements and alerts to the people who need them.', fields: [{ key: 'announcementChannelId', label: 'ANNOUNCEMENT CHANNEL ID', placeholder: 'Channel ID' }, { key: 'defaultMention', label: 'DEFAULT MENTION', placeholder: '@updates' }] },
  ticket: { name: 'Ticket', icon: 'fa-ticket', description: 'Configure support categories, staff roles, and ticket transcripts.', fields: [{ key: 'categoryId', label: 'TICKET CATEGORY ID', placeholder: 'Category ID' }, { key: 'supportRoleId', label: 'SUPPORT ROLE ID', placeholder: 'Role ID' }, { key: 'transcripts', label: 'TRANSCRIPTS', type: 'select', options: ['enabled', 'disabled'] }] },
  level: { name: 'Level', icon: 'fa-chart-line', description: 'Shape XP progression, rewards, and leaderboard visibility.', fields: [{ key: 'xpPerMessage', label: 'XP PER MESSAGE', type: 'number', placeholder: '15' }, { key: 'levelChannelId', label: 'LEVEL CHANNEL ID', placeholder: 'Optional channel ID' }, { key: 'leaderboard', label: 'PUBLIC LEADERBOARD', type: 'select', options: ['enabled', 'disabled'] }] }
};

const state = { user: null, guilds: [], guildId: null, selectedBot: 'music', settings: {} };
const $ = (selector) => document.querySelector(selector);
const authGate = $('#auth-gate');
const dashboardShell = $('#dashboard-shell');
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

async function api(path, options = {}) {
  const response = await fetch(path, { credentials: 'include', headers: { 'content-type': 'application/json', ...(options.headers || {}) }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error || `Request failed (${response.status})`);
  return data;
}
function avatarUrl(user) { return user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64` : ''; }
function initials(text) { return (text || 'D').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(); }
function showError(message) { const friendly = { oauth_not_configured: 'Secure setup is pending. Add the Discord OAuth values in the project input card before signing in.' }[message] || message; const note = $('#auth-note'); if (note) { note.textContent = friendly; note.classList.add('is-error'); } }

function renderUser() {
  $('#user-chip').hidden = false; $('#logout-link').hidden = false; $('#user-name').textContent = state.user.global_name || state.user.username;
  const avatar = $('#user-avatar'); const image = avatarUrl(state.user); if (image) avatar.style.backgroundImage = `url(${image})`; else avatar.textContent = initials(state.user.global_name || state.user.username);
}
function renderGuilds() {
  const list = $('#server-list');
  if (!state.guilds.length) { list.innerHTML = '<p class="empty-note">No manageable servers found.</p>'; return; }
  list.innerHTML = state.guilds.map((guild) => `<button class="server-button ${guild.id === state.guildId ? 'is-selected' : ''}" type="button" data-guild="${escapeHtml(guild.id)}"><span class="server-icon" ${guild.icon ? `style="background-image:url(https://cdn.discordapp.com/icons/${escapeHtml(guild.id)}/${escapeHtml(guild.icon)}.png?size=64)"` : ''}>${guild.icon ? '' : escapeHtml(initials(guild.name))}</span><span class="server-name">${escapeHtml(guild.name)}</span></button>`).join('');
  list.querySelectorAll('[data-guild]').forEach((button) => button.addEventListener('click', () => selectGuild(button.dataset.guild)));
}
function renderBotSwitcher() {
  $('#bot-switcher').innerHTML = Object.entries(botDefinitions).map(([key, bot]) => `<button class="bot-switch ${key === state.selectedBot ? 'is-selected' : ''}" type="button" data-bot="${key}"><i class="fa-solid ${bot.icon}"></i><span>${bot.name}</span></button>`).join('');
  $('#bot-switcher').querySelectorAll('[data-bot]').forEach((button) => button.addEventListener('click', () => { state.selectedBot = button.dataset.bot; renderBotSwitcher(); renderSettings(); }));
}
function fieldMarkup(field, values) {
  const value = values?.[field.key] ?? '';
  if (field.type === 'select') return `<div class="field"><label for="setting-${field.key}">${field.label}</label><select id="setting-${field.key}" name="${field.key}">${field.options.map((option) => `<option value="${escapeHtml(option)}" ${String(value) === option ? 'selected' : ''}>${escapeHtml(option.toUpperCase())}</option>`).join('')}</select></div>`;
  if (field.type === 'textarea') return `<div class="field full"><label for="setting-${field.key}">${field.label}</label><textarea id="setting-${field.key}" name="${field.key}" placeholder="${escapeHtml(field.placeholder || '')}">${escapeHtml(value)}</textarea></div>`;
  return `<div class="field"><label for="setting-${field.key}">${field.label}</label><input id="setting-${field.key}" name="${field.key}" type="${field.type || 'text'}" value="${escapeHtml(value)}" placeholder="${escapeHtml(field.placeholder || '')}" ${field.suffix ? `data-suffix="${escapeHtml(field.suffix)}"` : ''} /></div>`;
}
function renderSettings() {
  const bot = botDefinitions[state.selectedBot]; const botState = state.settings[state.selectedBot] || {};
  $('#settings-kicker').textContent = `MODULE / ${bot.name.toUpperCase()}`; $('#settings-title').textContent = bot.name; $('#settings-description').textContent = bot.description; $('#bot-enabled').checked = botState.enabled !== false;
  $('#settings-form').innerHTML = bot.fields.map((field) => fieldMarkup(field, botState)).join(''); $('#save-status').textContent = 'Changes are local until you save.';
}
async function selectGuild(guildId) {
  state.guildId = guildId; renderGuilds(); const guild = state.guilds.find((item) => item.id === guildId); $('#server-title').textContent = guild?.name || 'Selected server'; $('#server-subtitle').textContent = 'Loading module settings from Railway…'; $('#server-status-text').textContent = 'SYNCING';
  try { const data = await api(`/api/guilds/${encodeURIComponent(guildId)}/settings`); state.settings = data.settings || data || {}; $('#server-subtitle').textContent = 'Configure modules and save changes to your bot service.'; $('#server-status-text').textContent = 'CONNECTED'; renderSettings(); } catch (error) { state.settings = {}; $('#server-subtitle').textContent = error.message; $('#server-status-text').textContent = 'API SETUP NEEDED'; renderSettings(); }
}
async function saveSettings(event) {
  event.preventDefault(); if (!state.guildId) return; const form = new FormData(event.currentTarget); const values = Object.fromEntries(form.entries()); values.enabled = $('#bot-enabled').checked; $('#save-status').textContent = 'Saving to Railway…'; $('#save-button').disabled = true;
  try { await api(`/api/guilds/${encodeURIComponent(state.guildId)}/settings`, { method: 'PUT', body: JSON.stringify({ bot: state.selectedBot, settings: values }) }); state.settings[state.selectedBot] = values; $('#save-status').textContent = 'Saved just now.'; } catch (error) { $('#save-status').textContent = error.message; } finally { $('#save-button').disabled = false; }
}

async function init() {
  const error = new URLSearchParams(location.search).get('error'); if (error) showError(error);
  try {
    const session = await api('/api/auth/me');
    if (!session.authenticated) return;
    state.user = session.user; authGate.hidden = true; dashboardShell.hidden = false; renderUser(); renderBotSwitcher();
    state.guilds = await api('/api/guilds'); renderGuilds(); if (state.guilds[0]) await selectGuild(state.guilds[0].id); else $('#server-subtitle').textContent = 'No manageable servers found for this Discord account.';
  } catch (error) { showError(error.message); }
}
$('#settings-form').addEventListener('submit', saveSettings);
init();
