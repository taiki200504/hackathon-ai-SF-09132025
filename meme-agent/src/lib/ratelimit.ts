/**
 * ratelimit.ts - Simple in-memory rate limiting
 */

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

// In-memory store for rate limits
const rateLimitStore = new Map<string, RateLimitEntry>();

// Default rate limit: 60 requests per 5 minutes per IP
const DEFAULT_LIMIT = 60;
const DEFAULT_WINDOW = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Check if a request should be rate limited
 * @param identifier Unique identifier (usually IP address)
 * @param limit Maximum number of requests allowed in the time window
 * @param window Time window in milliseconds
 * @returns Object containing whether the request is allowed and remaining requests
 */
export function rateLimit(
  identifier: string,
  limit: number = DEFAULT_LIMIT,
  window: number = DEFAULT_WINDOW
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // If no entry exists or the entry has expired, create a new one
  if (!entry || entry.resetAt < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + window,
    };
    rateLimitStore.set(identifier, newEntry);
    return { allowed: true, remaining: limit - 1, resetAt: newEntry.resetAt };
  }

  // If the entry exists and is still valid, increment the count
  if (entry.count < limit) {
    entry.count += 1;
    rateLimitStore.set(identifier, entry);
    return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
  }

  // If the entry exists and the count is at or above the limit, reject the request
  return { allowed: false, remaining: 0, resetAt: entry.resetAt };
}

/**
 * Clean up expired rate limit entries
 * This should be called periodically to prevent memory leaks
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Set up automatic cleanup every hour
setInterval(cleanupRateLimits, 60 * 60 * 1000);