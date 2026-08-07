/**
 * ============================================================
 * Habibi Bites — Centralized Error Handling & Sanitization
 * ============================================================
 * Prevents raw database errors, SQL codes, internal paths, and
 * stack traces from ever leaking to end users in the UI.
 *
 * - Detailed error object and stack trace are logged to console
 *   for developer debugging.
 * - End users receive clean, safe, generic messages.
 * ============================================================
 */

import { ValidationError } from '../validation/Validator.js';
import { RateLimitError } from '../../infrastructure/rateLimiting/RateLimiter.js';

/**
 * Sanitizes errors for UI presentation.
 * Logs full technical details for debugging, returns clean user message.
 *
 * @param {any} err - The caught error object, string, or unknown thrown value
 * @param {string} [fallbackMessage] - Friendly fallback message for unexpected errors
 * @returns {string} Safe message suitable for UI display
 */
export function sanitizeError(err, fallbackMessage = 'An unexpected error occurred. Please try again.') {
  // 1. Log full technical details to console/logs for developer debugging
  if (err) {
    console.error('[System Error Log]:', {
      timestamp: new Date().toISOString(),
      name: err.name || 'Error',
      message: err.message || String(err),
      stack: err.stack || 'No stack trace available',
      raw: err,
    });
  } else {
    console.error('[System Error Log]: Unknown null/undefined error encountered.');
  }

  if (!err) return fallbackMessage;

  // 2. Pass through intentional domain errors (Validation & Rate Limiting)
  if (err instanceof ValidationError || err.name === 'ValidationError') {
    return err.message;
  }

  if (err instanceof RateLimitError || err.name === 'RateLimitError') {
    return err.message;
  }

  // 3. Handle known safe auth error strings without exposing internal details
  const errMsg = typeof err.message === 'string' ? err.message : String(err);
  const lowerMsg = errMsg.toLowerCase();

  if (lowerMsg.includes('invalid login credentials') || lowerMsg.includes('invalid credentials')) {
    return 'Invalid username or password. Please verify your credentials.';
  }

  if (lowerMsg.includes('email not confirmed')) {
    return 'Account email has not been verified yet.';
  }

  // 4. Default: Suppress raw database schema names, SQL errors, or stack traces
  return fallbackMessage;
}
