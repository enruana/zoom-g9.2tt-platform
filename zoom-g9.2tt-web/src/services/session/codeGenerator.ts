/**
 * Session code generator utilities
 *
 * Generates 6-character alphanumeric codes for session identification.
 * Avoids confusable characters (0/O, 1/l/I) for better readability.
 */

// Characters used for code generation (excludes 0, O, 1, l, I)
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;

/**
 * Generate a random session code.
 * @returns 6-character alphanumeric code (e.g., "ABC123")
 */
export function generateSessionCode(): string {
  let code = '';
  const randomValues = new Uint32Array(CODE_LENGTH);

  // Use crypto API for better randomness if available
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues);
  } else {
    // Fallback to Math.random
    for (let i = 0; i < CODE_LENGTH; i++) {
      randomValues[i] = Math.floor(Math.random() * CODE_CHARS.length);
    }
  }

  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS.charAt(randomValues[i]! % CODE_CHARS.length);
  }

  return code;
}

/**
 * Validate a session code format.
 * @param code The code to validate
 * @returns true if the code has valid format
 */
export function validateSessionCode(code: string): boolean {
  if (!code || code.length !== CODE_LENGTH) {
    return false;
  }

  // Normalize to uppercase
  const normalized = code.toUpperCase();

  // Check all characters are valid
  for (const char of normalized) {
    if (!CODE_CHARS.includes(char)) {
      return false;
    }
  }

  return true;
}

/**
 * Normalize a session code (uppercase, trimmed).
 * @param code The code to normalize
 * @returns Normalized code
 */
export function normalizeSessionCode(code: string): string {
  return code.trim().toUpperCase();
}
