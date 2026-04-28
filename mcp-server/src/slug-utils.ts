/**
 * Slug validation and normalization utilities.
 *
 * Slugs follow kebab-case: lowercase alphanumeric segments separated by
 * single hyphens, with no leading/trailing hyphens and no accented characters.
 */

/** Pattern that a valid slug must match. */
const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Returns `true` when `slug` is a valid kebab-case slug.
 *
 * Valid examples: "clinicas-derma-sp", "saas", "b2b-tech"
 * Invalid examples: "-leading", "trailing-", "UPPER", "acentuação", ""
 */
export function isValidSlug(slug: string): boolean {
  return SLUG_REGEX.test(slug);
}

/**
 * Best-effort conversion of an arbitrary string into a valid slug.
 *
 * Steps:
 * 1. Lowercase the input.
 * 2. Decompose Unicode (NFD) and strip combining diacritical marks (accents).
 * 3. Replace spaces and underscores with hyphens.
 * 4. Strip any character that is not `[a-z0-9-]`.
 * 5. Collapse consecutive hyphens into one.
 * 6. Trim leading and trailing hyphens.
 */
export function normalizeToSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // strip combining marks (accents)
    .replace(/[\s_]+/g, '-')           // spaces / underscores → hyphen
    .replace(/[^a-z0-9-]/g, '')        // strip invalid chars
    .replace(/-{2,}/g, '-')            // collapse consecutive hyphens
    .replace(/^-+|-+$/g, '');          // trim leading/trailing hyphens
}
