/**
 * An error whose message is written for the visitor (what went wrong and
 * what to do next) and is safe to show as-is. Anything else thrown during
 * processing is replaced with a generic message instead.
 */
export class UserFacingError extends Error {}
