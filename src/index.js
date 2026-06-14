/**
 * index.js — Application entry point for the ZENTRIX MD BY ZENTRIX TECH Bot Platform.
 * v3.3 FINAL — Added MenuService Catbox optimization.
 */

import 'dotenv/config';
import { sessionManager } from './core/sessionManager.js';
import { initializeTelegramBot } from './core/telegram.js';
import { commandRouter } from './handlers/commandRouter.js';
import { pluginLoader } from './core/pluginLoader.js';
import { userStorage } from './services/userStorage.js';
import { initDatabase } from './services/databaseService.js';
import { menuService } from './services/menuService.js';
import { startWebServer } from './web/server.js';
import logger from './utils/logger.js';

// ── Global error handlers ────────────────────────────────────────────────────

process.on('unhandledRejection', (reason, promise) => {
  logger.error('[Process] Unhandled Promise Rejection', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('[Process] Uncaught Exception — shutting down', error);
  process.exit(1);
});

// ── Graceful shutdown ────────────────────────────────────────────────────────

function handleShutdown(signal) {
  logger.warn(`[Process] Received ${signal}. Initiating graceful shutdown...`);
  for (const [id, session] of sessionManager.sessions.entries()) {
    if (session.sock?.ev) {
      session.sock.ev.removeAllListeners();
    }
  }
  process.exit(0);
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

// ── Main startup ─────────────────────────────────────────────────────────────

async function main() {
  console.clear();
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║    ⚡  Z E N T R I X   T E C H   E N T E R P R I S E  ⚡    ║
║             PROFESSIONAL CONTROL CORE v3.3                 ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);

  try {
    // Step 0: Initialize persistent storage
    logger.system('Initializing Persistent User Storage...');
    await userStorage.initialize();

    // Step 0.1: Initialize Group Settings Database
    logger.system('Initializing Group Settings Database...');
    await initDatabase();

    // Step 0.2: Initialize Menu Service (Catbox Optimization)
    logger.system('Initializing Menu Service (Catbox Optimization)...');
    await menuService.initialize();

    // Step 1: Load commands
    logger.system('Loading Command Modules...');
    await commandRouter.loadCommands();

    // Step 2: Load plugins
    logger.system('Loading Plugin Modules...');
    await pluginLoader.loadPlugins();

    // Step 3: Initialize Telegram bot
    logger.system('Initializing Telegram Enterprise Core...');
    initializeTelegramBot();

    // Step 3.5: Start web pairing portal
    logger.system('Starting Web Pairing Portal...');
    startWebServer();

    // Step 4: Restore all existing WhatsApp sessions
    logger.system('Restoring WhatsApp Sessions...');
    await sessionManager.loadAllSessions();

    logger.success('ZENTRIX MD BY ZENTRIX TECH Core fully operational.');
  } catch (error) {
    logger.error('[Main] Fatal error during startup. Exiting.', error);
    process.exit(1);
  }
}

main();
