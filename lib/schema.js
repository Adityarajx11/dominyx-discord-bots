// Single source of truth for the module settings contract.
//
// The dashboard reads and writes these columns; the six bot processes read the
// same columns from the same Postgres database. Each module owns its own table
// so a bot process never writes to another bot's configuration.
//
// Field types:
//   boolean    -> BOOLEAN
//   integer    -> INTEGER (validated against min/max)
//   text       -> TEXT
//   textarea   -> TEXT (free-form, rendered as a multi-line input)
//   enum       -> TEXT (restricted to `options`)
//   text-list  -> JSONB array of strings (one entry per line in the UI)
//   json-object-> JSONB object

const bool = (column, def = false) => ({ column, type: 'boolean', default: def });
const int = (column, def, min, max) => ({ column, type: 'integer', default: def, min, max });
const str = (column, def = null, maxLength = 2000) => ({ column, type: 'text', default: def, maxLength });
const list = (column, def = []) => ({ column, type: 'text-list', default: def });
const obj = (column, def = {}) => ({ column, type: 'json-object', default: def });
const choice = (column, options, def) => ({ column, type: 'enum', options, default: def });

export const MODULES = {
  music: {
    key: 'music',
    table: 'music_settings',
    label: 'Music',
    fields: {
      enabled: bool('enabled', true),
      stay247: bool('stay_247', false),
      defaultVolume: int('default_volume', 100, 0, 200),
      djRoleId: str('dj_role_id', null, 32),
      maxQueue: int('max_queue', 50, 1, 1000),
      leaveTimeoutMinutes: int('leave_timeout_minutes', 5, 0, 1440),
      announceChannelId: str('announce_channel_id', null, 32),
      prefix: str('prefix', '!', 5),
      xpEnabled: bool('xp_enabled', true),
      xpCooldownSec: int('xp_cooldown_sec', 300, 0, 86400),
    },
  },

  level: {
    key: 'level',
    table: 'level_config',
    label: 'Level',
    fields: {
      enabled: bool('enabled', true),
      channelId: str('channel_id', null, 32),
      messageTemplate: str('message_template', '🎉 {user} leveled up to **Level {level}**!', 2000),
      xpMin: int('xp_min', 15, 1, 1000),
      xpMax: int('xp_max', 25, 1, 1000),
      cooldownSeconds: int('cooldown_seconds', 60, 0, 86400),
      ignoredChannels: list('ignored_channels'),
      ignoredRoles: list('ignored_roles'),
      roleStack: bool('role_stack', true),
    },
  },

  greet: {
    key: 'greet',
    table: 'greet_settings',
    label: 'Greet',
    fields: {
      enabled: bool('enabled', true),
      welcomeChannelId: str('welcome_channel_id', null, 32),
      welcomeMessage: str('welcome_message', '🚀 {user} just landed in {server}!', 2000),
      autoRoleId: str('auto_role_id', null, 32),
      cardEnabled: bool('card_enabled', true),
      goodbyeChannelId: str('goodbye_channel_id', null, 32),
      goodbyeMessage: str('goodbye_message', '👋 **{user}** just left {server}.', 2000),
      dmWelcome: bool('dm_welcome', false),
      cardTheme: choice('card_theme', ['crimson', 'midnight', 'emerald', 'gold', 'violet', 'mono'], 'crimson'),
      greetBots: bool('greet_bots', false),
    },
  },

  ticket: {
    key: 'ticket',
    table: 'ticket_config',
    label: 'Ticket',
    fields: {
      enabled: bool('enabled', true),
      categoryChannelId: str('category_channel_id', null, 32),
      logChannelId: str('log_channel_id', null, 32),
      staffRoleId: str('staff_role_id', null, 32),
      maxTickets: int('max_tickets_per_user', 1, 1, 20),
      bannerUrl: str('banner_url', null, 500),
      inactiveCloseHours: int('inactive_close_hours', 0, 0, 168),
      dmClose: bool('dm_close', false),
      panelTitle: str('panel_title', null, 120),
      panelRules: str('panel_rules', null, 1000),
    },
  },

  ping: {
    key: 'ping',
    table: 'ping_settings',
    label: 'Ping',
    fields: {
      enabled: bool('enabled', true),
      youtubeChannelId: str('youtube_channel_id', null, 64),
      alertChannelId: str('live_alert_channel_id', null, 32),
      alertMessage: str('alert_message', null, 1000),
      mentionRoleId: str('mention_role_id', null, 32),
      pollMinutes: int('poll_minutes', 10, 1, 1440),
    },
  },

  guard: {
    key: 'guard',
    table: 'guard_settings',
    label: 'Security',
    fields: {
      enabled: bool('enabled', true),
      modlogChannelId: str('modlog_channel_id', null, 32),
      automodSpam: bool('automod_spam', false),
      spamThreshold: int('spam_threshold', 5, 1, 50),
      spamSeconds: int('spam_seconds', 10, 1, 300),
      automodLinks: bool('automod_links', false),
      automodCaps: bool('automod_caps', false),
      capsThreshold: int('caps_threshold', 70, 1, 100),
      automodMentions: bool('automod_mentions', false),
      mentionThreshold: int('mention_threshold', 5, 1, 50),
      automodEmoji: bool('automod_emoji', false),
      emojiThreshold: int('emoji_threshold', 10, 1, 100),
      automodWords: bool('automod_words', false),
      badWords: list('bad_words'),
      scamLinks: bool('scam_links', false),
      raidEnabled: bool('raid_enabled', false),
      raidJoins: int('raid_joins', 5, 1, 100),
      raidSeconds: int('raid_seconds', 10, 1, 600),
      raidAction: choice('raid_action', ['kick', 'timeout', 'ban'], 'kick'),
      raidCooldownMinutes: int('raid_cooldown_minutes', 10, 0, 1440),
      minAccountAgeDays: int('min_account_age_days', 0, 0, 3650),
      ageAction: choice('age_action', ['kick', 'timeout'], 'kick'),
      antinukeEnabled: bool('antinuke_enabled', true),
      nukeAction: choice('nuke_action', ['alert', 'timeout', 'ban'], 'alert'),
      nukeRollback: bool('nuke_rollback', true),
      muteRoleId: str('mute_role_id', null, 32),
      warnsMute: int('warns_mute', 3, 0, 100),
      warnsBan: int('warns_ban', 5, 0, 100),
      selfRoleCategories: obj('self_role_categories'),
    },
  },
};

export const MODULE_KEYS = Object.keys(MODULES);

const SQL_TYPES = {
  boolean: 'BOOLEAN',
  integer: 'INTEGER',
  text: 'TEXT',
  textarea: 'TEXT',
  enum: 'TEXT',
  'text-list': 'JSONB',
  'json-object': 'JSONB',
};

export function columnDefinition(field) {
  const type = SQL_TYPES[field.type] || 'TEXT';
  const defaultValue = field.default === null || field.default === undefined ? null : field.default;
  if (defaultValue === null) return `${field.column} ${type}`;
  if (field.type === 'boolean') return `${field.column} ${type} DEFAULT ${defaultValue}`;
  if (field.type === 'integer') return `${field.column} ${type} DEFAULT ${defaultValue}`;
  if (field.type === 'json-object') return `${field.column} ${type} DEFAULT '${JSON.stringify(defaultValue)}'::jsonb`;
  if (field.type === 'text-list') return `${field.column} ${type} DEFAULT '${JSON.stringify(defaultValue)}'::jsonb`;
  return `${field.column} ${type} DEFAULT '${String(defaultValue).replace(/'/g, "''")}'`;
}

// DDL for every module table plus the dashboard audit trail.
export function schemaStatements() {
  const statements = [];
  for (const module of Object.values(MODULES)) {
    const columns = Object.values(module.fields).map(columnDefinition);
    statements.push(
      `CREATE TABLE IF NOT EXISTS ${module.table} (
        guild_id TEXT PRIMARY KEY,
        ${columns.join(',\n        ')},
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,
    );
    for (const field of Object.values(module.fields)) {
      statements.push(
        `ALTER TABLE ${module.table} ADD COLUMN IF NOT EXISTS ${field.column} ${SQL_TYPES[field.type] || 'TEXT'}`,
      );
    }
  }
  statements.push(`CREATE TABLE IF NOT EXISTS dashboard_audit_log (
        id BIGSERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        module TEXT,
        action TEXT NOT NULL,
        changes JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`);
  statements.push('CREATE INDEX IF NOT EXISTS dashboard_audit_log_guild_idx ON dashboard_audit_log (guild_id, created_at DESC)');
  return statements;
}
