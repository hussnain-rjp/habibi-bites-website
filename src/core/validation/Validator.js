/**
 * ============================================================
 * Habibi Bites — Validation Engine
 * ============================================================
 * Strict schema-based validation. Values that do not match
 * their schema are REJECTED (a ValidationError is thrown).
 * Nothing is silently sanitized or coerced.
 * ============================================================
 */

import { SCHEMAS } from './schemas.js';

// ─── Custom error class ────────────────────────────────────────────────────

/**
 * Thrown when a field value fails schema validation.
 * @property {string} field   - The field key that failed (e.g. 'phone')
 * @property {string} message - Human-readable explanation
 */
export class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// ─── Core validator ────────────────────────────────────────────────────────

/**
 * Validate a single value against a schema.
 * Throws ValidationError on first violation.
 *
 * @param {object} schema      - A schema object from schemas.js
 * @param {*}      value       - The raw value to validate
 * @param {string} fieldLabel  - Human-readable field name for error messages
 * @param {string} fieldKey    - Internal field key (used in ValidationError.field)
 * @throws {ValidationError}
 */
export function validate(schema, value, fieldLabel, fieldKey) {
  // ── Null / empty guard ──────────────────────────────────────────────────
  if (value === null || value === undefined || String(value).trim() === '') {
    throw new ValidationError(fieldKey, `${fieldLabel} is required.`);
  }

  const strValue = String(value);

  // ── Type checks ─────────────────────────────────────────────────────────
  if (schema.type === 'string') {
    if (typeof value !== 'string') {
      throw new ValidationError(fieldKey, `${fieldLabel} must be text.`);
    }

    const trimmed = value.trim();

    if (schema.minLength !== undefined && trimmed.length < schema.minLength) {
      throw new ValidationError(
        fieldKey,
        `${fieldLabel} must be at least ${schema.minLength} character${schema.minLength !== 1 ? 's' : ''} long.`
      );
    }

    if (schema.maxLength !== undefined && trimmed.length > schema.maxLength) {
      throw new ValidationError(
        fieldKey,
        `${fieldLabel} must not exceed ${schema.maxLength} characters.`
      );
    }

    if (schema.pattern && !schema.pattern.test(trimmed)) {
      throw new ValidationError(
        fieldKey,
        schema.patternDesc
          ? `${fieldLabel} must be ${schema.patternDesc}.`
          : `${fieldLabel} contains invalid characters.`
      );
    }
  }

  if (schema.type === 'number' || schema.type === 'integer') {
    const num = Number(value);

    if (isNaN(num)) {
      throw new ValidationError(fieldKey, `${fieldLabel} must be a valid number.`);
    }

    if (schema.type === 'integer' && !Number.isInteger(num)) {
      throw new ValidationError(fieldKey, `${fieldLabel} must be a whole number.`);
    }

    if (schema.min !== undefined && num < schema.min) {
      throw new ValidationError(fieldKey, `${fieldLabel} must be at least ${schema.min}.`);
    }

    if (schema.max !== undefined && num > schema.max) {
      throw new ValidationError(fieldKey, `${fieldLabel} must not exceed ${schema.max}.`);
    }
  }

  // ── Allow-list check ────────────────────────────────────────────────────
  if (schema.allowedValues && !schema.allowedValues.includes(value)) {
    throw new ValidationError(
      fieldKey,
      `${fieldLabel} must be one of: ${schema.allowedValues.join(', ')}.`
    );
  }
}

// ─── Form validator ────────────────────────────────────────────────────────

/**
 * Validate an entire form at once.
 * Collects ALL field errors before returning (no early bail-out).
 *
 * @param {Object} schemaMap  - { fieldKey: schemaKey } e.g. { name: 'customerName' }
 * @param {Object} dataMap    - { fieldKey: value }      e.g. { name: 'Ali Khan' }
 * @param {Object} [labelMap] - { fieldKey: 'Display Label' } (optional, falls back to fieldKey)
 * @returns {{ valid: boolean, errors: { [fieldKey]: string } }}
 */
export function validateForm(schemaMap, dataMap, labelMap = {}) {
  const errors = {};

  for (const [fieldKey, schemaKey] of Object.entries(schemaMap)) {
    const schema = SCHEMAS[schemaKey];
    if (!schema) {
      console.warn(`[Validator] Unknown schema key: "${schemaKey}" for field "${fieldKey}"`);
      continue;
    }

    const value = dataMap[fieldKey];
    const label = labelMap[fieldKey] || toTitleCase(fieldKey);

    try {
      validate(schema, value, label, fieldKey);
    } catch (err) {
      if (err instanceof ValidationError) {
        errors[fieldKey] = err.message;
      } else {
        throw err; // unexpected — re-throw
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ─── Utility ───────────────────────────────────────────────────────────────

function toTitleCase(str) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim();
}
