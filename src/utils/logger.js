/**
 * logger.js — Advanced Professional Console Logging System for ZENTRIX MD BY ZENTRIX TECH Enterprise.
 * Features: Global Noise Filtering, Contextual Awareness, Reaction Debouncing, and Media Icons.
 */

import chalk from 'chalk';

// --- GLOBAL NOISE FILTER ---
// This overrides the default console to catch logs that bypass pino/baileys logger
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

const NOISE_KEYWORDS = [
  'Closing open session in favor of incoming prekey bundle',
  'Closing session: SessionEntry',
  'chainKey',
  'registrationId',
  'currentRatchet',
  'ephemeralKeyPair',
  'lastRemoteEphemeralKey',
  'previousCounter',
  'rootKey',
  'tried remove, but no previous op',
  'failed to sync state'
];

const shouldSilence = (args) => {
  const str = args.map(arg => String(arg)).join(' ');
  return NOISE_KEYWORDS.some(keyword => str.includes(keyword));
};

console.log = (...args) => { if (!shouldSilence(args)) originalLog(...args); };
console.warn = (...args) => { if (!shouldSilence(args)) originalWarn(...args); };
console.error = (...args) => { if (!shouldSilence(args)) originalError(...args); };

class AdvancedLogger {
  constructor() {
    this.levels = {
      INFO: chalk.blue('INFO'),
      SUCCESS: chalk.green('SUCCESS'),
      WARN: chalk.yellow('WARN'),
      ERROR: chalk.red('ERROR'),
      SYSTEM: chalk.magenta('SYSTEM'),
      WHATSAPP: chalk.cyan('WHATSAPP'),
      TELEGRAM: chalk.hex('#0088cc')('TELEGRAM'),
    };
    
    // Reaction Debouncer: Prevents spam from reactions
    this.reactionCache = new Map(); // key -> lastTimestamp
    this.REACTION_COOLDOWN = 2000; // 2 seconds per user/group
  }

  _formatTimestamp() {
    return chalk.gray(`[${new Date().toISOString().replace('T', ' ').substring(0, 19)}]`);
  }

  info(message, context = '') {
    originalLog(`${this._formatTimestamp()} ${this.levels.INFO} ${context ? `[${context}] ` : ''}${message}`);
  }

  success(message, context = '') {
    originalLog(`${this._formatTimestamp()} ${this.levels.SUCCESS} ${context ? `[${context}] ` : ''}${message}`);
  }

  warn(message, context = '') {
    originalLog(`${this._formatTimestamp()} ${this.levels.WARN} ${context ? `[${context}] ` : ''}${message}`);
  }

  error(message, error = null, context = '') {
    const errorMsg = error?.message || error || '';
    originalError(`${this._formatTimestamp()} ${this.levels.ERROR} ${context ? `[${context}] ` : ''}${message} ${errorMsg ? `| ${errorMsg}` : ''}`);
  }

  whatsapp(message, type = 'EVENT') {
    originalLog(`${this._formatTimestamp()} ${this.levels.WHATSAPP} [${type}] ${message}`);
  }

  telegram(message, type = 'EVENT') {
    originalLog(`${this._formatTimestamp()} ${this.levels.TELEGRAM} [${type}] ${message}`);
  }

  /**
   * Advanced Message Logging with Contextual Awareness
   */
  message(options) {
    const { 
      direction, // 'IN' or 'OUT'
      platform,  // 'WA' or 'TG'
      user,      // Name or Number
      content,   // Text or Type
      context,   // 'DM', 'GROUP', 'SELF', 'CHANNEL'
      groupName, // If context is GROUP
      type       // 'text', 'image', 'video', 'document', 'reaction', etc.
    } = options;

    // 1. Reaction Debouncing
    if (type === 'reaction') {
      const cacheKey = `${user}_${groupName || 'dm'}_reaction`;
      const now = Date.now();
      if (this.reactionCache.has(cacheKey) && (now - this.reactionCache.get(cacheKey) < this.REACTION_COOLDOWN)) {
        return; // Skip excessive reaction noise
      }
      this.reactionCache.set(cacheKey, now);
    }

    const dirIcon = direction === 'IN' ? chalk.green('→') : chalk.blue('←');
    const platformLabel = platform === 'WA' ? chalk.cyan('WA') : chalk.hex('#0088cc')('TG');
    const contextLabel = context === 'GROUP' ? chalk.magenta(`[GRP: ${groupName}]`) : 
                         context === 'SELF' ? chalk.yellow('[SELF]') : 
                         context === 'CHANNEL' ? chalk.blue('[CHN]') : chalk.gray('[DM]');
    
    const userLabel = chalk.yellow(user);
    
    // 2. Media Icon Mapping
    const typeIcons = {
      image: '🖼️ ',
      video: '🎥 ',
      audio: '🎵 ',
      document: '📁 ',
      sticker: '🎨 ',
      location: '📍 ',
      contact: '👤 ',
      reaction: '🎭 ',
      forwarded: '🔄 ',
      poll: '📊 '
    };

    const icon = typeIcons[type] || '';
    const cleanContent = String(content).replace(/\n/g, ' ').substring(0, 100);
    
    originalLog(`${this._formatTimestamp()} ${dirIcon} [${platformLabel}] ${contextLabel} ${userLabel}: ${icon}${cleanContent}`);
  }

  debug(message, context = '') {
    originalLog(`${this._formatTimestamp()} ${chalk.gray('DEBUG')} ${context ? `[${context}] ` : ''}${message}`);
  }

  system(message) {
    originalLog(`${this._formatTimestamp()} ${this.levels.SYSTEM} ${message}`);
  }
}

const logger = new AdvancedLogger();
export default logger;
