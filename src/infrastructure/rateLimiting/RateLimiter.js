/**
 * ============================================================
 * Habibi Bites — Rate Limiter Engine
 * ============================================================
 * Persists attempt history in localStorage so limits survive
 * page refreshes within the same browser session.
 *
 * Storage key format:
 *   rl:<tier>:<action-key>  →  JSON array of timestamps (ms)
 *
 * For auth, two keys are used:
 *   rl:auth:device           — per-device attempts
 *   rl:auth:account:<user>   — per-account attempts
 * ============================================================
 */

import { RATE_LIMIT_CONFIG } from './rateLimitConfig.js';

const STORAGE_PREFIX = 'rl:';

/**
 * Custom error thrown when a rate limit is exceeded.
 * Components can catch this and display the waitMs to the user.
 */
export class RateLimitError extends Error {
  /**
   * @param {string} message  - Human-readable message
   * @param {number} waitMs   - How many milliseconds to wait before retrying
   * @param {string} tier     - Which config tier triggered this ('auth' | 'publicWrite' | ...)
   */
  constructor(message, waitMs = 0, tier = '') {
    super(message);
    this.name = 'RateLimitError';
    this.waitMs = waitMs;
    this.tier = tier;
  }
}

// ─── Internal helpers ──────────────────────────────────────────────────────

/**
 * Read timestamps array from localStorage for a given storage key.
 * @param {string} storageKey
 * @returns {number[]}
 */
function readTimestamps(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Write timestamps array to localStorage.
 * @param {string} storageKey
 * @param {number[]} timestamps
 */
function writeTimestamps(storageKey, timestamps) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(timestamps));
  } catch {
    // localStorage full or blocked — fail silently, don't crash the app
  }
}

/**
 * Prune timestamps outside the current window and return the live ones.
 * @param {number[]} timestamps
 * @param {number}   windowMs
 * @returns {number[]}
 */
function pruneWindow(timestamps, windowMs) {
  const cutoff = Date.now() - windowMs;
  return timestamps.filter(t => t > cutoff);
}

/**
 * Compute the exponential backoff delay for a given attempt count.
 * Formula: min(base * 2^(attempts - 1), max)
 * @param {number} attempts  - How many failed attempts so far
 * @param {object} cfg       - The auth tier config object
 * @returns {number}         - Milliseconds to wait
 */
function computeBackoff(attempts, cfg) {
  if (attempts <= 0) return 0;
  const delay = cfg.backoffBaseMs * Math.pow(2, attempts - 1);
  return Math.min(delay, cfg.backoffMaxMs);
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Check whether an action is currently allowed for a given tier.
 * Throws RateLimitError if the limit is exceeded.
 *
 * @param {string} actionKey  - Unique key for this action (e.g. 'order', 'review')
 * @param {'auth'|'publicWrite'|'publicRead'|'authenticatedAction'} tier
 */
export function checkRateLimit(actionKey, tier) {
  const cfg = RATE_LIMIT_CONFIG[tier];
  if (!cfg) return; // unknown tier → allow

  const storageKey = `${STORAGE_PREFIX}${tier}:${actionKey}`;
  const timestamps = pruneWindow(readTimestamps(storageKey), cfg.windowMs);

  if (timestamps.length >= cfg.maxAttempts) {
    // Find the oldest timestamp in the window to calculate remaining wait
    const oldest = Math.min(...timestamps);
    const waitMs = (oldest + cfg.windowMs) - Date.now();
    const waitSec = Math.ceil(Math.max(waitMs, 0) / 1000);
    throw new RateLimitError(
      `Too many attempts. Please wait ${formatWait(waitMs)} before trying again.`,
      Math.max(waitMs, 0),
      tier
    );
  }
}

/**
 * Check auth rate limit with exponential backoff.
 * Checks BOTH per-device and per-account limits.
 *
 * @param {string} username  - The username/email being used to log in
 * @throws {RateLimitError}
 */
export function checkAuthRateLimit(username) {
  const cfg = RATE_LIMIT_CONFIG.auth;

  // ── Per-device check ──
  const deviceKey = `${STORAGE_PREFIX}auth:device`;
  const deviceTimestamps = pruneWindow(readTimestamps(deviceKey), cfg.windowMs);

  if (deviceTimestamps.length >= cfg.maxAttempts) {
    const backoffMs = computeBackoff(deviceTimestamps.length, cfg);
    const lastAttempt = Math.max(...deviceTimestamps);
    const waitMs = Math.max(0, (lastAttempt + backoffMs) - Date.now());
    throw new RateLimitError(
      `Too many login attempts from this device. Please wait ${formatWait(waitMs)}.`,
      waitMs,
      'auth'
    );
  }

  // ── Per-account check ──
  const accountKey = `${STORAGE_PREFIX}auth:account:${normalizeUsername(username)}`;
  const accountTimestamps = pruneWindow(readTimestamps(accountKey), cfg.perAccountWindowMs);

  if (accountTimestamps.length >= cfg.perAccountMaxAttempts) {
    const backoffMs = computeBackoff(accountTimestamps.length, cfg);
    const lastAttempt = Math.max(...accountTimestamps);
    const waitMs = Math.max(0, (lastAttempt + backoffMs) - Date.now());
    throw new RateLimitError(
      `Too many failed login attempts for this account. Please wait ${formatWait(waitMs)}.`,
      waitMs,
      'auth'
    );
  }
}

/**
 * Record a failed auth attempt for both per-device and per-account keys.
 * Call this ONLY on a failed login.
 *
 * @param {string} username
 */
export function recordAuthFailure(username) {
  const cfg = RATE_LIMIT_CONFIG.auth;
  const now = Date.now();

  // Record per-device
  const deviceKey = `${STORAGE_PREFIX}auth:device`;
  const deviceTimestamps = pruneWindow(readTimestamps(deviceKey), cfg.windowMs);
  writeTimestamps(deviceKey, [...deviceTimestamps, now]);

  // Record per-account
  const accountKey = `${STORAGE_PREFIX}auth:account:${normalizeUsername(username)}`;
  const accountTimestamps = pruneWindow(readTimestamps(accountKey), cfg.perAccountWindowMs);
  writeTimestamps(accountKey, [...accountTimestamps, now]);
}

/**
 * Record a successful auth — clears per-device and per-account attempt history.
 * No lingering penalty after a correct login.
 *
 * @param {string} username
 */
export function recordAuthSuccess(username) {
  const deviceKey = `${STORAGE_PREFIX}auth:device`;
  const accountKey = `${STORAGE_PREFIX}auth:account:${normalizeUsername(username)}`;
  try {
    localStorage.removeItem(deviceKey);
    localStorage.removeItem(accountKey);
  } catch { /* ignore */ }
}

/**
 * Record an attempt for non-auth tiers.
 * Call this AFTER the action is performed (or attempted).
 *
 * @param {string} actionKey
 * @param {'publicWrite'|'publicRead'|'authenticatedAction'} tier
 */
export function recordAttempt(actionKey, tier) {
  const cfg = RATE_LIMIT_CONFIG[tier];
  if (!cfg) return;

  const storageKey = `${STORAGE_PREFIX}${tier}:${actionKey}`;
  const timestamps = pruneWindow(readTimestamps(storageKey), cfg.windowMs);
  writeTimestamps(storageKey, [...timestamps, Date.now()]);
}

/**
 * Get remaining wait time in ms for a given key/tier.
 * Returns 0 if not limited.
 *
 * @param {string} actionKey
 * @param {string} tier
 * @returns {number}
 */
export function getWaitMs(actionKey, tier) {
  const cfg = RATE_LIMIT_CONFIG[tier];
  if (!cfg) return 0;

  const storageKey = `${STORAGE_PREFIX}${tier}:${actionKey}`;
  const timestamps = pruneWindow(readTimestamps(storageKey), cfg.windowMs);

  if (timestamps.length < cfg.maxAttempts) return 0;

  const oldest = Math.min(...timestamps);
  return Math.max(0, (oldest + cfg.windowMs) - Date.now());
}

// ─── Utility ───────────────────────────────────────────────────────────────

/**
 * Format a wait duration in ms to a human-readable string.
 * e.g. 90000 → "1 minute 30 seconds"
 * @param {number} ms
 * @returns {string}
 */
export function formatWait(ms) {
  if (ms <= 0) return '0 seconds';
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min > 0 && sec > 0) return `${min} minute${min > 1 ? 's' : ''} ${sec} second${sec > 1 ? 's' : ''}`;
  if (min > 0) return `${min} minute${min > 1 ? 's' : ''}`;
  return `${sec} second${sec > 1 ? 's' : ''}`;
}

/**
 * Normalise a username/email to a safe storage key segment.
 * @param {string} username
 * @returns {string}
 */
function normalizeUsername(username) {
  return (username || '').toLowerCase().replace(/[^a-z0-9@._-]/g, '_').slice(0, 64);
}
