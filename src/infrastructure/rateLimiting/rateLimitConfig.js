/**
 * ============================================================
 * Habibi Bites — Rate Limit Configuration
 * ============================================================
 * All thresholds are defined here. To change any limit,
 * edit the values below and refresh the page. No other
 * files need to be changed.
 *
 * windowMs    = time window in milliseconds
 * maxAttempts = max allowed actions within the window
 * ============================================================
 */

export const RATE_LIMIT_CONFIG = {

  /**
   * AUTH routes — strictest limits.
   * Applies to: Admin login
   *
   * Per-device: 5 attempts per 15 minutes before lockout.
   * Per-account: 3 attempts per 10 minutes per username.
   * Exponential backoff: 1s → 2s → 4s → 8s … up to 5 minutes.
   */
  auth: {
    maxAttempts: 20,
    windowMs: 15 * 60 * 1000,           // 15 minutes

    backoffBaseMs: 1000,                 // 1 second base delay
    backoffMaxMs: 5 * 60 * 1000,        // 5 minute cap

    perAccountMaxAttempts: 20,
    perAccountWindowMs: 10 * 60 * 1000, // 10 minutes per username
  },

  /**
   * PUBLIC WRITE routes — moderate limits.
   * Applies to: Place order, Submit review, Contact form.
   *
   * 5 submissions per 10 minutes per device.
   */
  publicWrite: {
    maxAttempts: 5,
    windowMs: 10 * 60 * 1000,           // 10 minutes
  },

  /**
   * PUBLIC READ routes — loose limits.
   * Applies to: Fetching menu items, deals, tracker lookups.
   *
   * 60 reads per minute — guards against runaway polling.
   */
  publicRead: {
    maxAttempts: 60,
    windowMs: 60 * 1000,                // 1 minute
  },

  /**
   * AUTHENTICATED ADMIN actions — very loose limits.
   * Applies to: Menu edits, deal edits, order status updates,
   *             review approvals, settings saves.
   *
   * 120 actions per minute — essentially just a circuit breaker.
   */
  authenticatedAction: {
    maxAttempts: 120,
    windowMs: 60 * 1000,                // 1 minute
  },
};
