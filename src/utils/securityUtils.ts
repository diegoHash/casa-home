/**
 * Utility functions for input sanitization and XSS / injection prevention.
 * Applies strict filtering on user-submitted text fields before persistence or rendering.
 */

/**
 * Strips HTML tags, script signatures, event handlers, and encodes dangerous characters.
 */
export function sanitizeText(input: string): string {
  if (!input) return '';

  return (
    input
      // Remove explicit <script> tags and their contents
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove inline event handlers (onerror=, onload=, onclick=, etc.)
      .replace(/on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
      // Remove javascript: and data: URIs
      .replace(/javascript\s*:/gi, '')
      .replace(/data\s*:\s*text\/html/gi, '')
      // Strip any remaining HTML tags
      .replace(/<[^>]*>/g, '')
      // Trim surrounding whitespace
      .trim()
  );
}

/**
 * Checks if an input string contains suspicious script or code injection patterns.
 */
export function containsScriptInjection(input: string): boolean {
  if (!input) return false;
  const lower = input.toLowerCase();

  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror\s*=/i,
    /onload\s*=/i,
    /onclick\s*=/i,
    /<iframe/i,
    /<embed/i,
    /<object/i,
    /eval\s*\(/i,
    /document\.cookie/i,
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(lower));
}

/**
 * Validates a Venezuelan / standard document number (e.g. V-12345678 or 12345678).
 */
export function sanitizeDocNumber(input: string): string {
  return input.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase().trim();
}

/**
 * Validates email format strictly.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/** Validates an email address suitable for a public owner-registration flow. */
export function isValidRegistrationEmail(email: string): boolean {
  const value = email.trim().toLowerCase();
  const registrationEmailRegex = /^(?![^@]*\.\.)[a-z0-9](?:[a-z0-9._%+-]{0,62}[a-z0-9])?@(?!(?:localhost|example|invalid|test)(?:\.|$))(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
  return registrationEmailRegex.test(value);
}

/**
 * Generates a unique, human-readable Folio Number (e.g. FOL-2026-8492).
 */
export function generateFolioNumber(): string {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `FOL-${year}-${randomDigits}`;
}
