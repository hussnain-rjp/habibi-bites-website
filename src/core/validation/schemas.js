/**
 * ============================================================
 * Habibi Bites — Input Validation Schemas
 * ============================================================
 * Every field schema lives here. Change a rule once — it
 * applies everywhere across the app.
 *
 * Schema shape:
 * {
 *   type        : 'string' | 'number' | 'integer'
 *   minLength   : number   (strings)
 *   maxLength   : number   (strings)
 *   min         : number   (numbers)
 *   max         : number   (numbers)
 *   pattern     : RegExp   (optional — applied AFTER length check)
 *   patternDesc : string   (human-readable explanation of pattern)
 *   allowedValues: any[]  (optional — exact allow-list)
 * }
 * ============================================================
 */

export const SCHEMAS = {

  // ── Admin Login ─────────────────────────────────────────

  /** Username or email for admin login */
  username: {
    type: 'string',
    minLength: 3,
    maxLength: 80,
    // Allow letters, digits, @, ., _, - (covers both bare names and emails)
    pattern: /^[a-zA-Z0-9@._\-]+$/,
    patternDesc: 'letters, numbers, @, ., _, - only',
  },

  /** Admin password — no structural constraints beyond length */
  password: {
    type: 'string',
    minLength: 6,
    maxLength: 128,
    // Reject ASCII control characters (< 0x20 except space, and 0x7F)
    pattern: /^[^\x00-\x1F\x7F]+$/,
    patternDesc: 'no control characters allowed',
  },

  // ── Order / Checkout ────────────────────────────────────

  /** Customer full name */
  customerName: {
    type: 'string',
    minLength: 2,
    maxLength: 60,
    // Letters (including Urdu-range Unicode), spaces, hyphens, dots
    pattern: /^[\p{L}\s.\-']+$/u,
    patternDesc: 'letters, spaces, hyphens, and dots only',
  },

  /**
   * Pakistani mobile phone number.
   * Accepts: 03001234567  |  0300-1234567  |  +923001234567
   * Normalised to digits-only for storage.
   */
  phone: {
    type: 'string',
    minLength: 10,
    maxLength: 15,
    pattern: /^(\+92|0)[\-\s]?3[0-9]{2}[\-\s]?[0-9]{7}$/,
    patternDesc: 'valid Pakistani mobile number, e.g. 0300-1234567',
  },

  /** Delivery address */
  address: {
    type: 'string',
    minLength: 10,
    maxLength: 200,
    // Printable ASCII + extended Unicode — reject nulls and control chars
    pattern: /^[^\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+$/,
    patternDesc: 'printable characters only',
  },

  // ── Reviews ─────────────────────────────────────────────

  /** Reviewer display name */
  reviewName: {
    type: 'string',
    minLength: 2,
    maxLength: 50,
    pattern: /^[\p{L}\s.\-']+$/u,
    patternDesc: 'letters and spaces only',
  },

  /** Star rating — must be an integer 1 to 5 */
  reviewRating: {
    type: 'integer',
    min: 1,
    max: 5,
  },

  /** Review body text */
  reviewComment: {
    type: 'string',
    minLength: 10,
    maxLength: 500,
    pattern: /^[^\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+$/,
    patternDesc: 'printable characters only',
  },

  // ── Contact Form ────────────────────────────────────────

  /** Contact form sender name */
  contactName: {
    type: 'string',
    minLength: 2,
    maxLength: 60,
    pattern: /^[\p{L}\s.\-']+$/u,
    patternDesc: 'letters and spaces only',
  },

  /**
   * Contact field — accepts either a Pakistani phone number
   * OR a standard email address.
   */
  contactContact: {
    type: 'string',
    minLength: 5,
    maxLength: 100,
    // Phone OR email
    pattern: /^((\+92|0)[\-\s]?3[0-9]{2}[\-\s]?[0-9]{7}|[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})$/,
    patternDesc: 'a valid phone number (0300-1234567) or email address',
  },

  /** Contact message body */
  contactMessage: {
    type: 'string',
    minLength: 10,
    maxLength: 1000,
    pattern: /^[^\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+$/,
    patternDesc: 'printable characters only',
  },

  // ── Admin: Delivery Settings ─────────────────────────────

  /** Delivery charge amount in Rupees */
  deliveryFee: {
    type: 'number',
    min: 0,
    max: 9999,
  },

  /** Maximum concurrent active orders the kitchen handles */
  maxOrders: {
    type: 'integer',
    min: 1,
    max: 500,
  },
};
