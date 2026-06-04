type Bucket = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 5;
const buckets = new Map<string, Bucket>();

export function isRateLimited(key: string) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  bucket.count += 1;
  return bucket.count > MAX_REQUESTS;
}

/**
 * Configurable rate limiter untuk API write endpoints.
 * Default lebih generous (20 req/min) untuk admin operations.
 */
export function isRateLimitedApi(
  key: string,
  maxRequests = 20,
  windowMs = 60 * 1000
) {
  const now = Date.now();
  const bucketKey = `api:${key}`;
  const bucket = buckets.get(bucketKey);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > maxRequests;
}
